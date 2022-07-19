import type { ValidationChecker, ValidatorCheckerFunction } from '../../validator/types/validation-checker';
import { change } from '../generic/change';

/** Changes string values to lower case using `toLocaleLowerCase` and then calls the specified checker on the transformed string */
export const changeStringLowerCase = (checker: ValidationChecker<string>): ValidatorCheckerFunction<string> =>
  change((value) => value.toLocaleLowerCase(), checker);

/** Changes string values to upper case using `toLocaleUpperCase` and then calls the specified checker on the transformed string */
export const changeStringUpperCase = (checker: ValidationChecker<string>): ValidatorCheckerFunction<string> =>
  change((value) => value.toLocaleUpperCase(), checker);
