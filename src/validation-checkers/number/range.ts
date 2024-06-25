import { defaultValidationError } from '../../consts/default-validation-error.js';
import type { ValidationCheckerFunction } from '../../validator/types/validation-checker';
import type { ValidationError } from '../../validator/types/validation-error';
import { checkIf } from '../generic/check-if.js';

/** Results in "validity" for any number greater than the specified value */
export const checkNumberGT = (
  anotherValue: number,
  validationError: ValidationError = defaultValidationError
): ValidationCheckerFunction<number> => checkIf((value) => value > anotherValue, validationError);

/** Results in "validity" for any number greater than or equal to the specified value */
export const checkNumberGTE = (
  anotherValue: number,
  validationError: ValidationError = defaultValidationError
): ValidationCheckerFunction<number> => checkIf((value) => value >= anotherValue, validationError);

/** Results in "validity" for any number less than the specified value */
export const checkNumberLT = (
  anotherValue: number,
  validationError: ValidationError = defaultValidationError
): ValidationCheckerFunction<number> => checkIf((value) => value < anotherValue, validationError);

/** Results in "validity" for any number less than or equal to the specified value */
export const checkNumberLTE = (
  anotherValue: number,
  validationError: ValidationError = defaultValidationError
): ValidationCheckerFunction<number> => checkIf((value) => value <= anotherValue, validationError);
