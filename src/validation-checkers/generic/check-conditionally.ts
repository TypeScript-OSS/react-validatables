import { resolveTypeOrDeferredTypeWithArgs, TypeOrDeferredTypeWithArgs } from 'react-bindings';

import { ValidationChecker, ValidationCheckerFunction } from '../../validator/types/validation-checker';
import { alwaysValid } from '../always';
import { checkValidity } from './logical/check-all-of';

/**
 * Select a checker based on the result of the specified conditional.  If the conditional evaluates to `true`, the `if` checker is used.
 * Otherwise, the `else` checker is used.
 *
 * `alwaysValid` is the default checker.
 */
export const checkConditionally =
  <T>(
    conditional: TypeOrDeferredTypeWithArgs<boolean, [T]>,
    { if: ifChecker = alwaysValid, else: elseChecker = alwaysValid }: { if?: ValidationChecker<T>; else?: ValidationChecker<T> }
  ): ValidationCheckerFunction<T> =>
  (value, args) => {
    const resolvedConditional = resolveTypeOrDeferredTypeWithArgs(conditional, [value]);
    return checkValidity(resolvedConditional ? ifChecker : elseChecker, value, args);
  };
