import { checkValidity } from '../../validation-checkers/generic/logical/check-all-of';
import type { ValidationChecker, ValidationCheckerArgs, ValidationCheckerFunction } from '../../validator/types/validation-checker';

/** Runs the specified transform function on the value and then calls the specified checker on the transformed value */
export const change =
  <T, R>(transform: (value: T) => R, checker: ValidationChecker<R>): ValidationCheckerFunction<T> =>
  (value: T, args: ValidationCheckerArgs) =>
    checkValidity(checker, transform(value), args);
