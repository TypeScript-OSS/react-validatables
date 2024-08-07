import { validState } from '../../consts/basic-validation-results.js';
import { defaultValidationError } from '../../consts/default-validation-error.js';
import type { ValidationCheckerFunction } from '../../validator/types/validation-checker';
import type { ValidationError } from '../../validator/types/validation-error';

/** Results in "validity" if the specified function returns `true` for a given value, otherwise results in "invalidity". */
export const checkIf =
  <T>(checker: (value: T) => boolean, validationError: ValidationError = defaultValidationError): ValidationCheckerFunction<T> =>
  (value) =>
    checker(value) ? validState : { isValid: false, validationError };
