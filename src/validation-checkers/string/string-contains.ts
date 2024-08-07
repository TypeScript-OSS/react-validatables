import type { SingleOrArray } from 'react-bindings';

import { defaultValidationError } from '../../consts/default-validation-error.js';
import type { ValidationCheckerFunction } from '../../validator/types/validation-checker';
import type { ValidationError } from '../../validator/types/validation-error';
import { checkIf } from '../generic/check-if.js';
import { checkAllOf } from '../generic/logical/check-all-of.js';
import { checkAnyOf } from '../generic/logical/check-any-of.js';

/** Results in "validity" for any string that contains any of the specified values */
export const checkStringContains = (
  values: SingleOrArray<string>,
  validationError: ValidationError = defaultValidationError
): ValidationCheckerFunction<string> =>
  Array.isArray(values)
    ? checkAnyOf(values.map((value) => checkStringContains(value, validationError)))
    : checkIf((value) => value.includes(values), validationError);

/** Results in "validity" for any string that contains all of the specified values */
export const checkStringContainsAllOf = (
  values: string[],
  validationError: ValidationError = defaultValidationError
): ValidationCheckerFunction<string> => checkAllOf(values.map((value) => checkStringContains(value, validationError)));

/** Results in "validity" for any string that does not contain any of the specified values */
export const checkStringNotContains = (
  values: SingleOrArray<string>,
  validationError: ValidationError = defaultValidationError
): ValidationCheckerFunction<string> =>
  Array.isArray(values)
    ? checkAnyOf(values.map((value) => checkStringNotContains(value, validationError)))
    : checkIf((value) => !value.includes(values), validationError);
