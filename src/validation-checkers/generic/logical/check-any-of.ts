import type { TFunction } from 'i18next';

import { validState } from '../../../consts/basic-validation-results';
import { defaultValidationError } from '../../../consts/default-validation-error';
import { USE_FIRST_ERROR, USE_LAST_ERROR } from '../../../consts/logical-validation-checkers';
import { runAllAfterInteractions } from '../../../internal-utils/run-all-after-interactions';
import type { ValidationChecker, ValidationCheckerFunction } from '../../../validator/types/validation-checker';
import type { ValidationError } from '../../../validator/types/validation-error';
import type { ValidationResult } from '../../../validator/types/validation-result';
import { resolveValidationError } from '../../../validator/utils/resolve-validation-error';
import { checkValidity } from './check-all-of';

/**
 * Requires that at least one of the specified validators are satisfied.
 *
 * If none of the specified validators are satisfied, the specified validation error is used.
 *
 * The `validationError` parameter supports special options:
 * - `"use-first-error"` - The first error is used, using the same order as `checkers`.  See `USE_FIRST_ERROR`
 * - `"use-last-error"` - The last error is used, using the same order as `checkers`.  See `USE_LAST_ERROR`
 * - `string` - An error
 * - `function` - A function that produces a validation error, which can be used, for example, to combine the results
 */
export const checkAnyOf =
  <T>(
    checkers: Array<ValidationChecker<T> | undefined>,
    validationError: string | ((t: TFunction | void, results: Array<ValidationResult | undefined>) => ValidationError) = USE_LAST_ERROR
  ): ValidationCheckerFunction<T> =>
  async (value, args) => {
    const { wasReset } = args;

    if (wasReset()) {
      return validState;
    }

    const results = await runAllAfterInteractions<ValidationResult>(
      'validator.checkAnyOf',
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

    let firstError: ValidationError | undefined;
    let lastError: ValidationError | undefined;
    for (const result of results) {
      if (result !== undefined) {
        if (result.isValid) {
          return validState;
        } else {
          if (firstError === undefined) {
            firstError = result.validationError;
          }
          lastError = result.validationError;
        }
      }
    }

    let resolvedValidationError: ValidationError | undefined;
    if (validationError === USE_FIRST_ERROR) {
      resolvedValidationError = firstError;
    } else if (validationError === USE_LAST_ERROR) {
      resolvedValidationError = lastError;
    } else if (typeof validationError === 'function') {
      resolvedValidationError = (t) => resolveValidationError(validationError(t, results), t);
    } else {
      resolvedValidationError = validationError;
    }

    return { isValid: false, validationError: resolvedValidationError ?? defaultValidationError };
  };
