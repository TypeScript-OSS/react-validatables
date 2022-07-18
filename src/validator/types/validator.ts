import type { TypeOrPromisedType } from 'react-waitables';

import type { ValidationResult } from '../../types/validation-result';

export interface ValidatorArgs {
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
export type ValidatorFunction<ValueT> = (value: ValueT, args: ValidatorArgs) => TypeOrPromisedType<ValidationResult>;

/** A function that produces a `ValidationResult`, a `ValidationResult` directly, or an array of validators, which implies an all-of check */
export type Validator<ValueT> = ValidatorFunction<ValueT> | ValidationResult | Array<Validator<ValueT> | undefined>;
