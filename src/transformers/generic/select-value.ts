import type { Validator, ValidatorArgs, ValidatorFunction } from '../../validator/types/validator';
import { validate } from '../../validators/generic/logical/check-all-of';

/** Selects a different value to continue validation with */
export const selectValue =
  <T>(selectedValue: T, validator: Validator<T>): ValidatorFunction<any> =>
  (_value: any, args: ValidatorArgs) =>
    validate(validator, selectedValue, args);
