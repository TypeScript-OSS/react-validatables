import { validState } from '../../../consts/basic-validation-results';
import { defaultValidationError } from '../../../consts/default-validation-error';
import { runAllAfterInteractions } from '../../../internal-utils/run-all-after-interactions';
import type { ValidationChecker, ValidationCheckerFunction } from '../../../validator/types/validation-checker';
import type { ValidationError } from '../../../validator/types/validation-error';
import type { ValidationResult } from '../../../validator/types/validation-result';
import { checkValidity } from './check-all-of';

/**
 * Requires that none of the specified validators are satisfied.
 *
 * If any of the specified validators are satisfied, the specified validation error is used.
 */
export const checkNoneOf =
  <T>(
    checkers: Array<ValidationChecker<T> | undefined>,
    validationError: ValidationError = defaultValidationError
  ): ValidationCheckerFunction<T> =>
  async (value, args) => {
    const { wasReset } = args;

    if (wasReset()) {
      return validState;
    }

    const results = await runAllAfterInteractions<ValidationResult>(
      'validator.checkNoneOf',
      checkers.map((validator) => async ({ stop, wasStopped }) => {
        if (validator === undefined) {
          return undefined;
        }

        if (wasReset() || wasStopped()) {
          stop();
          return undefined;
        }

        const result = await checkValidity(validator, value, args);
        if (result.isValid) {
          stop();
        }

        return result;
      })
    );

    for (const result of results) {
      if (result !== undefined && result.isValid) {
        return { isValid: false, validationError };
      }
    }

    return validState;
  };
