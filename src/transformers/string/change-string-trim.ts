import type { ValidationChecker, ValidationCheckerFunction } from '../../validator/types/validation-checker';
import { change } from '../generic/change.js';

/** Changes string values by calling `trim` and then calls the specified checker on the transformed string */
export const changeStringTrim = (checker: ValidationChecker<string>): ValidationCheckerFunction<string> =>
  change((value) => value.trim(), checker);
