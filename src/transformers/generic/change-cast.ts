import { checkValidity } from '../../validation-checkers/generic/logical/check-all-of.js';
import type { ValidationChecker, ValidationCheckerArgs, ValidationCheckerFunction } from '../../validator/types/validation-checker';

/** Forces a type change and continues checking.  This is inherently unsafe from a compiler point of view, so it's up to the caller to
 * ensure logical soundness */
export const changeCast =
  <R>(checker: ValidationChecker<R>): ValidationCheckerFunction<any> =>
  (value: any, args: ValidationCheckerArgs) =>
    checkValidity(checker, value as any as R, args);
