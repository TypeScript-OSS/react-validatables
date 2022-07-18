import type { TypeOrDeferredType } from 'react-bindings';

import { validState } from '../consts/basic-validation-results';
import { defaultValidationError } from '../consts/default-validation-error';
import type { ValidatorFunction } from '../validator/types/validator';

/** Always results in "validity" */
export const alwaysValid = validState;

/** Always results in "invalidity" */
export const alwaysInvalid =
  (validationError: TypeOrDeferredType<string> = defaultValidationError): ValidatorFunction<any> =>
  () => ({
    isValid: false,
    validationError
  });
