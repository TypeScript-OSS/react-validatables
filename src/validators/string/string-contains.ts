import type { SingleOrArray, TypeOrDeferredType } from 'react-bindings';

import { defaultValidationError } from '../../consts/default-validation-error';
import type { ValidatorFunction } from '../../validator/types/validator';
import { checkIf } from '../generic/check-if';
import { checkAllOf } from '../generic/logical/check-all-of';
import { checkAnyOf } from '../generic/logical/check-any-of';

/** Results in "validity" for any string that contains any of the specified values */
export const checkStringContains = (
  values: SingleOrArray<string>,
  validationError: TypeOrDeferredType<string> = defaultValidationError
): ValidatorFunction<string> =>
  Array.isArray(values)
    ? checkAnyOf(values.map((value) => checkStringContains(value, validationError)))
    : checkIf((value) => value.includes(values), validationError);

/** Results in "validity" for any string that contains all of the specified values */
export const checkStringContainsAllOf = (
  values: string[],
  validationError: TypeOrDeferredType<string> = defaultValidationError
): ValidatorFunction<string> => checkAllOf(values.map((value) => checkStringContains(value, validationError)));

/** Results in "validity" for any string that does not contain any of the specified values */
export const checkStringNotContains = (
  values: SingleOrArray<string>,
  validationError: TypeOrDeferredType<string> = defaultValidationError
): ValidatorFunction<string> =>
  Array.isArray(values)
    ? checkAnyOf(values.map((value) => checkStringNotContains(value, validationError)))
    : checkIf((value) => !value.includes(values), validationError);
