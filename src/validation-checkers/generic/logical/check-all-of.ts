import type { TypeOrPromisedType } from 'react-waitables';

import { validState } from '../../../consts/basic-validation-results';
import { runAllAfterInteractions } from '../../../internal-utils/run-all-after-interactions';
import type { ValidationChecker, ValidationCheckerArgs, ValidationCheckerFunction } from '../../../validator/types/validation-checker';
import type { ValidationError } from '../../../validator/types/validation-error';
import type { ValidationResult } from '../../../validator/types/validation-result';

/**
 * Requires that all of the specified validators are satisfied.
 *
 * If any of the specified validators are unsatisfied, the validation error is either the specified validation error or the first invalid
 * validator's error.
 */
export const checkAllOf =
  <T>(checkers: Array<ValidationChecker<T> | undefined>, validationError?: ValidationError): ValidationCheckerFunction<T> =>
  async (value, args) => {
    const { wasReset } = args;

    if (wasReset()) {
      return validState;
    }

    const results = await runAllAfterInteractions<ValidationResult>(
      'validator.checkAllOf',
      checkers.map((validator) => async ({ stop, wasStopped }) => {
        if (validator === undefined) {
          return undefined;
        }

        if (wasReset() || wasStopped()) {
          stop();
          return undefined;
        }

        const result = await checkValidity(validator, value, args);
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

export const checkValidity = <T>(
  checker: ValidationChecker<T>,
  value: T,
  args: ValidationCheckerArgs
): TypeOrPromisedType<ValidationResult> =>
  typeof checker === 'function'
    ? checker(value, args)
    : Array.isArray(checker)
    ? checkValidity<T>(checkAllOf<T>(checker), value, args)
    : checker;
