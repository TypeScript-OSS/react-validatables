import { defaultValidationError } from '../../consts/default-validation-error.js';
import type { ValidationCheckerFunction } from '../../validator/types/validation-checker';
import type { ValidationError } from '../../validator/types/validation-error';
import { checkIf } from '../generic/check-if.js';

/** Results in "validity" for empty strings */
export const checkStringEmpty = (validationError: ValidationError = defaultValidationError): ValidationCheckerFunction<string> =>
  checkIf((value) => value.length === 0, validationError);

/** Results in "validity" for non-empty strings */
export const checkStringNotEmpty = (validationError: ValidationError = defaultValidationError): ValidationCheckerFunction<string> =>
  checkIf((value) => value.length > 0, validationError);

/** Results in "validity" for strings that are at least the specified number of characters long, using `.length` */
export const checkStringAtLeastChars = (
  inclusiveMinLength: number,
  validationError: ValidationError = defaultValidationError
): ValidationCheckerFunction<string> => checkIf((value) => value.length >= inclusiveMinLength, validationError);

/** Results in "validity" for strings that are at most the specified number of characters long, using `.length` */
export const checkStringAtMostChars = (
  inclusiveMaxLength: number,
  validationError: ValidationError = defaultValidationError
): ValidationCheckerFunction<string> => checkIf((value) => value.length <= inclusiveMaxLength, validationError);

/** Results in "validity" for strings that are exactly the specified number of characters long, using `.length` */
export const checkStringLength = (
  expectedLength: number,
  validationError: ValidationError = defaultValidationError
): ValidationCheckerFunction<string> => checkIf((value) => value.length === expectedLength, validationError);
