import type { SingleOrArray, TypeOrDeferredType } from 'react-bindings';

import { defaultValidationError } from '../../consts/default-validation-error';
import type { ValidatorFunction } from '../../validator/types/validator';
import { checkIf } from './check-if';

/** Results in "validity" if a given value equals, using `===`, any of the specified values. */
export const checkEquals = <T>(
  oneOf: SingleOrArray<T>,
  validationError: TypeOrDeferredType<string> = defaultValidationError
): ValidatorFunction<T> => checkIf((value) => (Array.isArray(oneOf) ? oneOf.includes(value) : oneOf === value), validationError);

/** Results in "validity" if a given value does not equal, using `!==`, any of the specified values. */
export const checkNotEquals = <T>(
  anyOf: SingleOrArray<T>,
  validationError: TypeOrDeferredType<string> = defaultValidationError
): ValidatorFunction<T> => checkIf((value) => (Array.isArray(anyOf) ? !anyOf.includes(value) : anyOf !== value), validationError);
