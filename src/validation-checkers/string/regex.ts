import type { SingleOrArray } from 'react-bindings';

import { defaultValidationError } from '../../consts/default-validation-error.js';
import type { ValidationCheckerFunction } from '../../validator/types/validation-checker';
import type { ValidationError } from '../../validator/types/validation-error';
import { checkIf } from '../generic/check-if.js';
import { checkAllOf } from '../generic/logical/check-all-of.js';
import { checkAnyOf } from '../generic/logical/check-any-of.js';

/** Results in "validity" for any string that matches any of the specified regular expressions */
export const checkStringMatchesRegex = (
  regexes: SingleOrArray<RegExp>,
  validationError: ValidationError = defaultValidationError
): ValidationCheckerFunction<string> =>
  Array.isArray(regexes)
    ? checkAnyOf(regexes.map((regex) => checkStringMatchesRegex(regex, validationError)))
    : checkIf((value) => regexes.exec(value) !== null, validationError);

/** Results in "validity" for any string that matches all of the specified regular expressions */
export const checkStringMatchesRegexAllOf = (
  regexes: RegExp[],
  validationError: ValidationError = defaultValidationError
): ValidationCheckerFunction<string> => checkAllOf(regexes.map((regex) => checkStringMatchesRegex(regex, validationError)));

/** Results in "validity" for any string that does not match any the specified regular expression */
export const checkStringNotMatchesRegex = (
  regex: RegExp,
  validationError: ValidationError = defaultValidationError
): ValidationCheckerFunction<string> => checkIf((value) => regex.exec(value) === null, validationError);
