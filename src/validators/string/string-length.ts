import type { TypeOrDeferredType } from 'react-bindings';

import { defaultValidationError } from '../../consts/default-validation-error';
import type { ValidatorFunction } from '../../validator/types/validator';
import { checkIf } from '../generic/check-if';

/** Results in "validity" for empty strings */
export const checkStringEmpty = (validationError: TypeOrDeferredType<string> = defaultValidationError): ValidatorFunction<string> =>
  checkIf((value) => value.length === 0, validationError);

/** Results in "validity" for non-empty strings */
export const checkStringNotEmpty = (validationError: TypeOrDeferredType<string> = defaultValidationError): ValidatorFunction<string> =>
  checkIf((value) => value.length > 0, validationError);

/** Results in "validity" for strings that are at least the specified number of characters long, using `.length` */
export const checkStringAtLeastChars = (
  inclusiveMinLength: number,
  validationError: TypeOrDeferredType<string> = defaultValidationError
): ValidatorFunction<string> => checkIf((value) => value.length >= inclusiveMinLength, validationError);

/** Results in "validity" for strings that are at most the specified number of characters long, using `.length` */
export const checkStringAtMostChars = (
  inclusiveMaxLength: number,
  validationError: TypeOrDeferredType<string> = defaultValidationError
): ValidatorFunction<string> => checkIf((value) => value.length <= inclusiveMaxLength, validationError);
