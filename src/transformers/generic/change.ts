import type { Validator, ValidatorArgs, ValidatorFunction } from '../../validator/types/validator';
import { validate } from '../../validators/generic/logical/check-all-of';

/** Runs the specified transform function on the value and then calls the specified validator on the transformed value */
export const change =
  <T, R>(transform: (value: T) => R, validator: Validator<R>): ValidatorFunction<T> =>
  (value: T, args: ValidatorArgs) =>
    validate(validator, transform(value), args);
