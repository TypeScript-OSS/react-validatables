import { validState } from '../../consts/basic-validation-results';
import { defaultValidationError } from '../../consts/default-validation-error';
import type { ValidatorCheckerFunction } from '../../validator/types/validation-checker';
import type { ValidationError } from '../../validator/types/validation-error';

/** Results in "validity" if the specified function returns `true` for a given value, otherwise results in "invalidity". */
export const checkIf =
  <T>(checker: (value: T) => boolean, validationError: ValidationError = defaultValidationError): ValidatorCheckerFunction<T> =>
  (value) =>
    checker(value) ? validState : { isValid: false, validationError };
