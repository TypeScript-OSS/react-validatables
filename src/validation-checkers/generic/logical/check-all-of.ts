import type { TFunction } from 'i18next';
import type { TypeOrPromisedType } from 'react-waitables';

import { validState } from '../../../consts/basic-validation-results.js';
import { defaultValidationError } from '../../../consts/default-validation-error.js';
import { USE_FIRST_ERROR, USE_LAST_ERROR } from '../../../consts/logical-validation-checkers.js';
import { runAllAfterInteractions } from '../../../internal-utils/run-all-after-interactions.js';
import type { ValidationChecker, ValidationCheckerArgs, ValidationCheckerFunction } from '../../../validator/types/validation-checker';
import type { ValidationError } from '../../../validator/types/validation-error';
import type { ValidationResult } from '../../../validator/types/validation-result';
import { resolveValidationError } from '../../../validator/utils/resolve-validation-error.js';

/**
 * Requires that all of the specified validators are satisfied.
 *
 * If any of the specified validators are unsatisfied, the validation error is either the specified validation error or the first invalid
 * validator's error.
 *
 * The `validationError` parameter supports special options:
 * - `"use-first-error"` - The first error is used, using the same order as `checkers`.  See `USE_FIRST_ERROR`
 * - `"use-last-error"` - The last error is used, using the same order as `checkers`.  See `USE_LAST_ERROR`
 * - `string` - An error
 * - `function` - A function that produces a validation error, which can be used, for example, to combine the results
 *
 * Note that if `validationError` is `"use-last-error"` or if it's a function, then computation won't stop on the first error, which could
 * impact performance.
 */
export const checkAllOf = <T>(
  checkers: Array<ValidationChecker<T> | undefined>,
  validationError: string | ((t: TFunction | void, results: Array<ValidationResult | undefined>) => ValidationError) = USE_FIRST_ERROR
): ValidationCheckerFunction<T> => {
  const shouldStopOnFirstError = typeof validationError === 'string' && validationError !== USE_LAST_ERROR;

  return async (value, args) => {
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
        if (!result.isValid && shouldStopOnFirstError) {
          stop();
        }

        return result;
      })
    );

    let firstError: ValidationError | undefined;
    let lastError: ValidationError | undefined;
    for (const result of results) {
      if (result !== undefined) {
        if (!result.isValid) {
          if (firstError === undefined) {
            firstError = result.validationError;
          }
          lastError = result.validationError;
        }
      }
    }

    if (firstError === undefined && lastError === undefined) {
      return validState;
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
};

export const checkValidity = <T>(
  checker: ValidationChecker<T>,
  value: T,
  args: ValidationCheckerArgs
): TypeOrPromisedType<ValidationResult> => {
  if (typeof checker === 'function') {
    return checker(value, args);
  } else if (Array.isArray(checker)) {
    return checkValidity<T>(checkAllOf<T>(checker), value, args);
  } else {
    return checker;
  }
};
