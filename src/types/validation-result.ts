import type { TypeOrDeferredType } from 'react-bindings';

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
      validationError: TypeOrDeferredType<string>;
    };
