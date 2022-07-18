import type { Validator, ValidatorFunction } from '../../validator/types/validator';
import { change } from '../generic/change';

/** Changes string values to lower case using `toLocaleLowerCase` and then calls the specified validator on the transformed string */
export const changeStringLowerCase = (validator: Validator<string>): ValidatorFunction<string> =>
  change((value) => value.toLocaleLowerCase(), validator);

/** Changes string values to upper case using `toLocaleUpperCase` and then calls the specified validator on the transformed string */
export const changeStringUpperCase = (validator: Validator<string>): ValidatorFunction<string> =>
  change((value) => value.toLocaleUpperCase(), validator);
