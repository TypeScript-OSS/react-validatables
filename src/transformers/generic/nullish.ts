import type { TypeOrDeferredType } from 'react-bindings';

import { validState } from '../../consts/basic-validation-results';
import { defaultValidationError } from '../../consts/default-validation-error';
import type { Validator, ValidatorArgs, ValidatorFunction } from '../../validator/types/validator';
import { alwaysValid } from '../../validators/always';
import { validate } from '../../validators/generic/logical/check-all-of';

/** Results in "validity" for `null` or any value that satisfies the specified validator */
export const allowNull =
  <T>(validator: Validator<T> = alwaysValid): ValidatorFunction<T | null> =>
  (value: T | null, args: ValidatorArgs) =>
    value === null ? validState : validate(validator, value, args);

/** Results in "validity" for `null` and `undefined` or any value that satisfies the specified validator */
export const allowNullish =
  <T>(validator: Validator<T> = alwaysValid): ValidatorFunction<T | null | undefined> =>
  (value: T | null | undefined, args: ValidatorArgs) =>
    value === null || value === undefined ? validState : validate(validator, value, args);

/** Results in "validity" for `undefined` or any value that satisfies the specified validator */
export const allowUndefined =
  <T>(validator: Validator<T> = alwaysValid): ValidatorFunction<T | undefined> =>
  (value: T | undefined, args: ValidatorArgs) =>
    value === undefined ? validState : validate(validator, value, args);

/** Results in "invalidity" for `null`.  Otherwise results in "validity" for any value that satisfies the specified validator */
export const preventNull =
  <T>(
    validator: Validator<T> = alwaysValid,
    validationError: TypeOrDeferredType<string> = defaultValidationError
  ): ValidatorFunction<T | null> =>
  (value: T | null, args: ValidatorArgs) =>
    value === null ? { isValid: false, validationError } : validate(validator, value, args);

/** Results in "invalidity" for `null` and `undefined`.  Otherwise results in "validity" for any value that satisfies the specified
 * validator */
export const preventNullish =
  <T>(
    validator: Validator<T> = alwaysValid,
    validationError: TypeOrDeferredType<string> = defaultValidationError
  ): ValidatorFunction<T | null | undefined> =>
  (value: T | null | undefined, args: ValidatorArgs) =>
    value === null || value === undefined ? { isValid: false, validationError } : validate(validator, value, args);

/** Results in "invalidity" for `undefined`.  Otherwise results in "validity" for any value that satisfies the specified validator */
export const preventUndefined =
  <T>(
    validator: Validator<T> = alwaysValid,
    validationError: TypeOrDeferredType<string> = defaultValidationError
  ): ValidatorFunction<T | undefined> =>
  (value: T | undefined, args: ValidatorArgs) =>
    value === undefined ? { isValid: false, validationError } : validate(validator, value, args);
