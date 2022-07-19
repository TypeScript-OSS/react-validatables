import type { TypeOrPromisedType } from 'react-waitables';

import type { ValidationResult } from './validation-result';

export interface ValidationCheckerArgs {
  /**
   * Determines if the validator was reset after it was called.  If it was reset, any results will be ignored, so it's safe to stop work
   * early.
   *
   * @returns `true` if the validator was reset
   */
  wasReset: () => boolean;
}

/**
 * A potentially-async function that checks the validity of a value.
 *
 * Async functions should check `wasReset` to avoid doing unnecessary work.
 */
export type ValidatorCheckerFunction<ValueT> = (value: ValueT, args: ValidationCheckerArgs) => TypeOrPromisedType<ValidationResult>;

/** A function that produces a `ValidationResult`, a `ValidationResult` directly, or an array of validation checkers, which implies an
 * all-of check */
export type ValidationChecker<ValueT> = ValidatorCheckerFunction<ValueT> | ValidationResult | Array<ValidationChecker<ValueT> | undefined>;
