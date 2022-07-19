import type { ValidationChecker, ValidatorCheckerFunction } from '../../validator/types/validation-checker';
import { change } from '../generic/change';

/** Changes string values by calling `trim` and then calls the specified checker on the transformed string */
export const changeStringTrim = (checker: ValidationChecker<string>): ValidatorCheckerFunction<string> =>
  change((value) => value.trim(), checker);
