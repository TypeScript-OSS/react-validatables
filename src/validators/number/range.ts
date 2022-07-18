import type { TypeOrDeferredType } from 'react-bindings';

import { defaultValidationError } from '../../consts/default-validation-error';
import type { ValidatorFunction } from '../../validator/types/validator';
import { checkIf } from '../generic/check-if';

/** Results in "validity" for any number greater than the specified value */
export const checkNumberGT = (
  anotherValue: number,
  validationError: TypeOrDeferredType<string> = defaultValidationError
): ValidatorFunction<number> => checkIf((value) => value > anotherValue, validationError);

/** Results in "validity" for any number greater than or equal to the specified value */
export const checkNumberGTE = (
  anotherValue: number,
  validationError: TypeOrDeferredType<string> = defaultValidationError
): ValidatorFunction<number> => checkIf((value) => value >= anotherValue, validationError);

/** Results in "validity" for any number less than the specified value */
export const checkNumberLT = (
  anotherValue: number,
  validationError: TypeOrDeferredType<string> = defaultValidationError
): ValidatorFunction<number> => checkIf((value) => value < anotherValue, validationError);

/** Results in "validity" for any number less than or equal to the specified value */
export const checkNumberLTE = (
  anotherValue: number,
  validationError: TypeOrDeferredType<string> = defaultValidationError
): ValidatorFunction<number> => checkIf((value) => value <= anotherValue, validationError);
