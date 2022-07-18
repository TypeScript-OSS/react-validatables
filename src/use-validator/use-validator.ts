import { ReadonlyBinding, useDerivedBinding } from 'react-bindings';
import { InferOptionalWaitableAndBindingValueTypes, TypeOrPromisedType, useDerivedWaitable, WaitableDependencies } from 'react-waitables';

import { disabledState, validState } from '../consts/basic-validation-results';
import { useCallbackRef } from '../internal-hooks/use-callback-ref';
import { normalizeAsArray } from '../internal-utils/array-like';
import type { ValidationResult } from '../types/validation-result';
import type { Validator, ValidatorArgs } from '../validator/types/validator';
import { validate } from '../validators/generic/logical/check-all-of';
import { areAnyBindingsFalsey } from './internal/are-any-bindings-falsey';
import { areAnyBindingsTruthy } from './internal/are-any-bindings-truthy';
import type { UseValidatorArgs } from './types/use-validator-args';

const emptyBindingsArray = Object.freeze([]) as unknown as Array<ReadonlyBinding | undefined>;

/**
 * A validator is a waitable that produces a `ValidationResult`, indicating validity or a problem, if all of its dependencies are loaded (or
 * if the validator is disabled).
 *
 * Basic example:
 *
 * ```
 * const myBindingValidator = useValidator(myBinding, checkEquals('hello', 'expected "hello"'), { id: 'myBindingValidator' });
 * ```
 */
export const useValidator = <DependenciesT extends WaitableDependencies>(
  dependencies: DependenciesT | undefined,
  validators: (
    dependencyValues: InferOptionalWaitableAndBindingValueTypes<DependenciesT>,
    dependencies: DependenciesT,
    args: ValidatorArgs
  ) => TypeOrPromisedType<Validator<InferOptionalWaitableAndBindingValueTypes<DependenciesT>> | undefined>,
  {
    id = 'validator',
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
) => {
  const limiterOptions = { limitMSec, limitMode, limitType, priority, queue };

  /** If any of these bindings are falsey, this validator is disabled */
  const disabledUntil = disabledUntilBindings !== undefined ? normalizeAsArray(disabledUntilBindings) : emptyBindingsArray;
  /** If any of these bindings are true, this validator is disabled */
  const disabledWhile = disabledWhileBindings !== undefined ? normalizeAsArray(disabledWhileBindings) : emptyBindingsArray;
  /** If any of these bindings are unmodified, this validator is disabled */
  const disabledWhileUnmodified =
    disabledWhileUnmodifiedBindings !== undefined ? normalizeAsArray(disabledWhileUnmodifiedBindings) : emptyBindingsArray;

  /** If true, this validator is disabled */
  const isDisabledBinding = useDerivedBinding(
    [...disabledUntil, ...disabledWhile, ...disabledWhileUnmodified],
    (): boolean => areAnyBindingsFalsey(disabledUntil) || areAnyBindingsTruthy(disabledWhile),
    { id: `${id}_disabled`, limitType: 'none' }
  );
  const isDisabled = useCallbackRef(() => {
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
    {
      ifLoaded: async (values, dependencies, _setFailure, wasReset): Promise<ValidationResult | undefined> => {
        if (wasReset()) {
          return undefined;
        }

        if (isDisabled()) {
          return disabledState;
        }

        const args: ValidatorArgs = { wasReset };

        const resolvedValidators = await validators(values, dependencies, args);
        if (wasReset()) {
          return undefined;
        }

        if (resolvedValidators !== undefined) {
          return validate(resolvedValidators, values, args);
        } else {
          return validState;
        }
      }
    },
    {
      id,
      addFields: () => ({ isDisabled }),
      hardResetBindings: isDisabledBinding,
      defaultValue: () => (isDisabled() ? disabledState : undefined),
      ...limiterOptions
    }
  );
};
