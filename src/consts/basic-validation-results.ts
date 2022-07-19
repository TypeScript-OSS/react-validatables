import type { ValidationResult } from '../validator/types/validation-result';

/** Always returned by disabled validators, which are always valid */
export const disabledState = Object.freeze({ isDisabled: true, isValid: true, validationError: undefined } as ValidationResult);

/** Always returns by enabled validators for valid values */
export const validState = Object.freeze({ isDisabled: false, isValid: true, validationError: undefined } as ValidationResult);
