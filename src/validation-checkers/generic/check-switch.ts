import type { TypeOrDeferredTypeWithArgs } from 'react-bindings';
import { resolveTypeOrDeferredTypeWithArgs } from 'react-bindings';

import type { ValidationChecker, ValidationCheckerFunction } from '../../validator/types/validation-checker';
import { alwaysValid } from '../always.js';
import { checkValidity } from './logical/check-all-of.js';

/**
 * Select a checker based on a specified switching value.
 *
 * If none of the cases match the keys in `checkersByCase`, the `defaultChecker` is used, which is `alwaysValid` by default.
 */
export const checkSwitch =
  <S extends string | number | symbol, T>(
    switchingValue: TypeOrDeferredTypeWithArgs<S, [T]>,
    checkersByCase: Partial<Record<S, ValidationChecker<T> | undefined>>,
    defaultChecker: ValidationChecker<T> = alwaysValid
  ): ValidationCheckerFunction<T> =>
  (value, args) => {
    const resolvedSwitchingValue = resolveTypeOrDeferredTypeWithArgs(switchingValue, [value]);
    return checkValidity(checkersByCase[resolvedSwitchingValue] ?? defaultChecker, value, args);
  };
