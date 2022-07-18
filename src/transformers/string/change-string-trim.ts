import type { Validator, ValidatorFunction } from '../../validator/types/validator';
import { change } from '../generic/change';

/** Changes string values by calling `trim` and then calls the specified validator on the transformed string */
export const changeStringTrim = (validator: Validator<string>): ValidatorFunction<string> => change((value) => value.trim(), validator);
