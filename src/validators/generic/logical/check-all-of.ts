import type { TypeOrDeferredType } from 'react-bindings';
import { TypeOrPromisedType } from 'react-waitables';

import { validState } from '../../../consts/basic-validation-results';
import { runAllAfterInteractions } from '../../../internal-utils/run-all-after-interactions';
import type { ValidationResult } from '../../../types/validation-result';
import type { Validator, ValidatorArgs, ValidatorFunction } from '../../../validator/types/validator';

/**
 * Requires that all of the specified validators are satisfied.
 *
 * If any of the specified validators are unsatisfied, the validation error is either the specified validation error or the first invalid
 * validator's error.
 */
export const checkAllOf =
  <T>(validators: Array<Validator<T> | undefined>, validationError?: TypeOrDeferredType<string>): ValidatorFunction<T> =>
  async (value, args) => {
    const { wasReset } = args;

    if (wasReset()) {
      return validState;
    }

    const results = await runAllAfterInteractions<ValidationResult>(
      'validator.checkAllOf',
      validators.map((validator) => async ({ stop, wasStopped }) => {
        if (validator === undefined) {
          return undefined;
        }

        if (wasReset() || wasStopped()) {
          stop();
          return undefined;
        }

        const result = await validate(validator, value, args);
        if (!result.isValid) {
          stop();
        }

        return result;
      })
    );

    for (const result of results) {
      if (result !== undefined && !result.isValid) {
        return validationError !== undefined ? { isValid: false, validationError } : result;
      }
    }

    return validState;
  };

export const validate = <T>(validator: Validator<T>, value: T, args: ValidatorArgs): TypeOrPromisedType<ValidationResult> =>
  typeof validator === 'function'
    ? validator(value, args)
    : Array.isArray(validator)
    ? validate<T>(checkAllOf<T>(validator), value, args)
    : validator;
