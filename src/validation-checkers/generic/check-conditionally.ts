import type { TypeOrDeferredTypeWithArgs } from 'react-bindings';
import { resolveTypeOrDeferredTypeWithArgs } from 'react-bindings';

import type { ValidationChecker, ValidationCheckerFunction } from '../../validator/types/validation-checker';
import { alwaysValid } from '../always';
import { checkValidity } from './logical/check-all-of';

/**
 * Select a checker based on the result of the specified conditional.  If the conditional evaluates to `true`, the `then` checker is used.
 * Otherwise, the `else` checker is used.
 *
 * `alwaysValid` is the default checker.
 */
export const checkConditionally =
  <T>({
    if: conditional,
    then: thenCheck = alwaysValid,
    else: elseCheck = alwaysValid
  }: {
    if: TypeOrDeferredTypeWithArgs<boolean, [T]>;
    then?: ValidationChecker<T>;
    else?: ValidationChecker<T>;
  }): ValidationCheckerFunction<T> =>
  (value, args) => {
    const resolvedConditional = resolveTypeOrDeferredTypeWithArgs(conditional, [value]);
    return checkValidity(resolvedConditional ? thenCheck : elseCheck, value, args);
  };
