import { validState } from '../consts/basic-validation-results';
import { defaultValidationError } from '../consts/default-validation-error';
import type { ValidationCheckerFunction } from '../validator/types/validation-checker';
import type { ValidationError } from '../validator/types/validation-error';

/** Always results in "validity" */
export const alwaysValid = validState;

/** Always results in "invalidity" */
export const alwaysInvalid =
  (validationError: ValidationError = defaultValidationError): ValidationCheckerFunction<any> =>
  () => ({
    isValid: false,
    validationError
  });
