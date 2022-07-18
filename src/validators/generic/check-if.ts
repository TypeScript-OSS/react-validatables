import type { TypeOrDeferredType } from 'react-bindings';

import { validState } from '../../consts/basic-validation-results';
import { defaultValidationError } from '../../consts/default-validation-error';
import type { ValidatorFunction } from '../../validator/types/validator';

/** Results in "validity" if the specified function returns `true` for a given value, otherwise results in "invalidity". */
export const checkIf =
  <T>(checker: (value: T) => boolean, validationError: TypeOrDeferredType<string> = defaultValidationError): ValidatorFunction<T> =>
  (value) =>
    checker(value) ? validState : { isValid: false, validationError };
