import type { ValidationChecker, ValidationCheckerArgs, ValidatorCheckerFunction } from '../../validator/types/validation-checker';
import { checkValidity } from '../../validators/generic/logical/check-all-of';

/** Runs the specified transform function on the value and then calls the specified checker on the transformed value */
export const change =
  <T, R>(transform: (value: T) => R, checker: ValidationChecker<R>): ValidatorCheckerFunction<T> =>
  (value: T, args: ValidationCheckerArgs) =>
    checkValidity(checker, transform(value), args);
