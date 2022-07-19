import type { ValidationError } from './validation-error';

/** The result of validating a value */
export type ValidationResult =
  // If valid or disabled
  | {
      isDisabled?: boolean;
      isValid: true;
      validationError?: undefined;
    }
  // If invalid
  | {
      isDisabled?: false;
      isValid: false;
      validationError: ValidationError;
    };
