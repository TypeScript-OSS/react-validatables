import { ReadonlyBinding, useBinding, useDerivedBinding } from 'react-bindings';
import { InferRequiredWaitableAndBindingValueTypes, TypeOrPromisedType, useDerivedWaitable, WaitableDependencies } from 'react-waitables';

import { disabledState, validState } from '../consts/basic-validation-results';
import { useCallbackRef } from '../internal-hooks/use-callback-ref';
import { normalizeAsArray } from '../internal-utils/array-like';
import { checkValidity } from '../validation-checkers/generic/logical/check-all-of';
import type { ValidationChecker, ValidationCheckerArgs } from '../validator/types/validation-checker';
import type { ValidationResult } from '../validator/types/validation-result';
import type { Validator } from '../validator/types/validator';
import { areAnyBindingsFalsey } from './internal/are-any-bindings-falsey';
import { areAnyBindingsTruthy } from './internal/are-any-bindings-truthy';
import type { UseValidatorArgs } from './types/use-validator-args';

const emptyBindingsArray = Object.freeze([]) as unknown as Array<ReadonlyBinding | undefined>;

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
  validators: (
    dependencyValues: InferRequiredWaitableAndBindingValueTypes<DependenciesT>,
    dependencies: DependenciesT,
    args: ValidationCheckerArgs
  ) => TypeOrPromisedType<ValidationChecker<InferRequiredWaitableAndBindingValueTypes<DependenciesT>> | undefined>,
  {
    id = 'validator',
    deps,
    disabledUntil: disabledUntilBindings,
    disabledWhile: disabledWhileBindings,
    disabledWhileUnmodified: disabledWhileUnmodifiedBindings,
    // LimiterOptions
    limitMSec,
    limitMode,
    limitType,
    priority,
    queue
  }: UseValidatorArgs = {}
): Validator => {
  const limiterOptions = { limitMSec, limitMode, limitType, priority, queue };

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

  return useDerivedWaitable(
    dependencies,
    async (values, dependencies, _setFailure, wasReset): Promise<ValidationResult | undefined> => {
      if (wasReset()) {
        return undefined;
      }

      if (isDisabled()) {
        return disabledState;
      }

      const args: ValidationCheckerArgs = { wasReset };

      const resolvedValidators = await validators(values, dependencies, args);
      if (wasReset()) {
        return undefined;
      }

      if (resolvedValidators !== undefined) {
        return checkValidity(resolvedValidators, values, args);
      } else {
        return validState;
      }
    },
    {
      id,
      deps,
      addFields: () => ({
        isDisabled,
        setDisabledOverride: (disabled: boolean | undefined) => disabledOverride.set(disabled)
      }),
      hardResetBindings: isDisabledBinding,
      defaultValue: () => (isDisabled() ? disabledState : undefined),
      ...limiterOptions
    }
  );
};
