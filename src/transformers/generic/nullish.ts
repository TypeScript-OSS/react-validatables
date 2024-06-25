import { validState } from '../../consts/basic-validation-results.js';
import { defaultValidationError } from '../../consts/default-validation-error.js';
import { alwaysValid } from '../../validation-checkers/always.js';
import { checkValidity } from '../../validation-checkers/generic/logical/check-all-of.js';
import type { ValidationChecker, ValidationCheckerArgs, ValidationCheckerFunction } from '../../validator/types/validation-checker';
import type { ValidationError } from '../../validator/types/validation-error';

/** Results in "validity" for `null` or any value that satisfies the specified checker */
export const allowNull =
  <T>(checker: ValidationChecker<T> = alwaysValid): ValidationCheckerFunction<T | null> =>
  (value: T | null, args: ValidationCheckerArgs) =>
    value === null ? validState : checkValidity(checker, value, args);

/** Results in "validity" for `null` and `undefined` or any value that satisfies the specified checker */
export const allowNullish =
  <T>(checker: ValidationChecker<T> = alwaysValid): ValidationCheckerFunction<T | null | undefined> =>
  (value: T | null | undefined, args: ValidationCheckerArgs) =>
    value === null || value === undefined ? validState : checkValidity(checker, value, args);

/** Results in "validity" for `undefined` or any value that satisfies the specified checker */
export const allowUndefined =
  <T>(checker: ValidationChecker<T> = alwaysValid): ValidationCheckerFunction<T | undefined> =>
  (value: T | undefined, args: ValidationCheckerArgs) =>
    value === undefined ? validState : checkValidity(checker, value, args);

/** Results in "invalidity" for `null`.  Otherwise results in "validity" for any value that satisfies the specified checker */
export const preventNull =
  <T>(
    checker: ValidationChecker<T> = alwaysValid,
    validationError: ValidationError = defaultValidationError
  ): ValidationCheckerFunction<T | null> =>
  (value: T | null, args: ValidationCheckerArgs) =>
    value === null ? { isValid: false, validationError } : checkValidity(checker, value, args);

/** Results in "invalidity" for `null` and `undefined`.  Otherwise results in "validity" for any value that satisfies the specified
 * checker */
export const preventNullish =
  <T>(
    checker: ValidationChecker<T> = alwaysValid,
    validationError: ValidationError = defaultValidationError
  ): ValidationCheckerFunction<T | null | undefined> =>
  (value: T | null | undefined, args: ValidationCheckerArgs) =>
    value === null || value === undefined ? { isValid: false, validationError } : checkValidity(checker, value, args);

/** Results in "invalidity" for `undefined`.  Otherwise results in "validity" for any value that satisfies the specified checker */
export const preventUndefined =
  <T>(
    checker: ValidationChecker<T> = alwaysValid,
    validationError: ValidationError = defaultValidationError
  ): ValidationCheckerFunction<T | undefined> =>
  (value: T | undefined, args: ValidationCheckerArgs) =>
    value === undefined ? { isValid: false, validationError } : checkValidity(checker, value, args);
