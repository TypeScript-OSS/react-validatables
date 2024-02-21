import type { EmptyObject, ReadonlyBinding } from 'react-bindings';
import { isBinding, pickLimiterOptions, useBinding, useBindingEffect, useCallbackRef, useDerivedBinding } from 'react-bindings';
import type { InferRequiredWaitableAndBindingValueTypes, TypeOrPromisedType, WaitableDependencies } from 'react-waitables';
import { isWaitable, useDerivedWaitable } from 'react-waitables';

import { disabledState, validState } from '../consts/basic-validation-results';
import { normalizeAsArray } from '../internal-utils/array-like';
import { checkValidity } from '../validation-checkers/generic/logical/check-all-of';
import type { ValidationChecker, ValidationCheckerArgs } from '../validator/types/validation-checker';
import type { ValidationResult } from '../validator/types/validation-result';
import type { Validator } from '../validator/types/validator';
import { isValidator } from '../validator/utils/is-validator';
import { areAnyBindingsFalsey } from './internal/are-any-bindings-falsey';
import { areAnyBindingsTruthy } from './internal/are-any-bindings-truthy';
import type { UseValidatorArgs } from './types/use-validator-args';

const emptyBindingsArray = Object.freeze([]) as unknown as Array<ReadonlyBinding | undefined>;
const emptyDependencies = Object.freeze({} as EmptyObject);

/**
 * A validator is a waitable that produces a `ValidationResult`, indicating either validity or a problem, if all of its dependencies are
 * loaded (or if the validator is disabled).
 *
 * Basic example:
 *
 * ```
 * const myBindingValidator = useValidator(myBinding, checkEquals('hello', 'expected "hello"'), { id: 'myBindingValidator' });
 * console.log('isValid', myBindingValidator.value.get()?.isValid);
 * ```
 */
export const useValidator = <DependenciesT extends WaitableDependencies>(
  dependencies: DependenciesT | undefined,
  makeChecker: (
    dependencyValues: InferRequiredWaitableAndBindingValueTypes<DependenciesT>,
    dependencies: DependenciesT,
    args: ValidationCheckerArgs
  ) => TypeOrPromisedType<ValidationChecker<InferRequiredWaitableAndBindingValueTypes<DependenciesT>> | undefined>,
  args: UseValidatorArgs<DependenciesT> = {}
): Validator => {
  const {
    id = 'validator',
    deps,
    disabledUntil: disabledUntilBindings,
    disabledWhile: disabledWhileBindings,
    disabledWhileUnmodified: disabledWhileUnmodifiedBindings,
    extraFinalizationCheckers
  } = args;

  const limiterOptions = pickLimiterOptions(args);

  /** If any of these bindings are falsey, this validator is disabled */
  const disabledUntil = disabledUntilBindings !== undefined ? normalizeAsArray(disabledUntilBindings) : emptyBindingsArray;
  /** If any of these bindings are true, this validator is disabled */
  const disabledWhile = disabledWhileBindings !== undefined ? normalizeAsArray(disabledWhileBindings) : emptyBindingsArray;
  /** If any of these bindings are unmodified, this validator is disabled */
  const disabledWhileUnmodified =
    disabledWhileUnmodifiedBindings !== undefined ? normalizeAsArray(disabledWhileUnmodifiedBindings) : emptyBindingsArray;

  /** If defined, overrides all other disabling factors (i.e. disabledUntil, disabledWhile, and disabledWhileUnmodified) */
  const disabledOverride = useBinding<boolean | undefined>(() => undefined, { id: 'disabledOverrides', detectChanges: true });

  /** If true, this validator is disabled */
  const isDisabledBinding = useDerivedBinding(
    [disabledOverride, ...disabledUntil, ...disabledWhile, ...disabledWhileUnmodified],
    (): boolean => disabledOverride.get() ?? (areAnyBindingsFalsey(disabledUntil) || areAnyBindingsTruthy(disabledWhile)),
    { id: `${id}_disabled`, limitType: 'none' }
  );
  const isDisabled = useCallbackRef(() => {
    const override = disabledOverride.get();
    if (override !== undefined) {
      return override;
    }

    if (isDisabledBinding.get()) {
      return true;
    }

    for (const binding of disabledWhileUnmodified) {
      if (binding !== undefined && !binding.isModified()) {
        return true;
      }
    }

    return false;
  });

  const isFinalizing = useBinding(() => false, { id: 'isFinalizing', detectChanges: true });

  const outputWaitable = useDerivedWaitable(
    dependencies,
    async (values, dependencies, _setFailure, wasReset): Promise<ValidationResult | undefined> => {
      if (wasReset()) {
        return undefined;
      }

      if (isDisabled()) {
        return disabledState;
      }

      const args: ValidationCheckerArgs = { wasReset };

      const checkers = await makeChecker(values, dependencies, args);
      if (wasReset()) {
        return undefined;
      }

      const resolvedExtraFinalizationCheckers = isFinalizing.get()
        ? await extraFinalizationCheckers?.(values, dependencies, args)
        : undefined;

      if (checkers !== undefined) {
        return checkValidity(
          resolvedExtraFinalizationCheckers !== undefined ? [checkers, resolvedExtraFinalizationCheckers] : checkers,
          values,
          args
        );
      } else if (resolvedExtraFinalizationCheckers !== undefined) {
        return checkValidity(resolvedExtraFinalizationCheckers, values, args);
      } else {
        return validState;
      }
    },
    {
      id,
      deps,
      addFields: () => ({
        isValidator: true as const,
        isDisabled,
        setDisabledOverride: (disabled: boolean | undefined) => disabledOverride.set(disabled),
        setIsFinalizing: isFinalizing.set
      }),
      hardResetBindings: isDisabledBinding,
      defaultValue: () => (isDisabled() ? disabledState : undefined),
      ...limiterOptions
    }
  );

  useBindingEffect(
    isFinalizing,
    (isFinalizing) => {
      const isNonNamedDependencies = Array.isArray(dependencies) || isWaitable(dependencies) || isBinding(dependencies);
      const nonNamedDependencies = isNonNamedDependencies ? dependencies : undefined;
      const namedDependencies = isNonNamedDependencies ? undefined : dependencies;
      const allDependencies = isNonNamedDependencies
        ? normalizeAsArray(nonNamedDependencies)
        : Object.values(namedDependencies ?? emptyDependencies);
      const allValidators = allDependencies.filter((dep) => isValidator(dep)) as Validator[];
      for (const validator of allValidators) {
        validator.setIsFinalizing(isFinalizing);
      }

      if (isFinalizing && extraFinalizationCheckers !== undefined) {
        outputWaitable.reset('hard');
      }
    },
    { limitType: 'none' }
  );

  return outputWaitable;
};
