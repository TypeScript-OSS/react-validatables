import type { TypeOrDeferredType } from 'react-bindings';

import { validState } from '../../../consts/basic-validation-results';
import { defaultValidationError } from '../../../consts/default-validation-error';
import { runAllAfterInteractions } from '../../../internal-utils/run-all-after-interactions';
import type { ValidationResult } from '../../../types/validation-result';
import type { Validator, ValidatorFunction } from '../../../validator/types/validator';
import { validate } from './check-all-of';

/**
 * Requires that at least one of the specified validators are satisfied.
 *
 * If none of the specified validators are satisfied, the specified validation error is used.
 */
export const checkAnyOf =
  <T>(
    validators: Array<Validator<T> | undefined>,
    validationError: TypeOrDeferredType<string> = defaultValidationError
  ): ValidatorFunction<T> =>
  async (value, args) => {
    const { wasReset } = args;

    if (wasReset()) {
      return validState;
    }

    const results = await runAllAfterInteractions<ValidationResult>(
      'validator.checkAnyOf',
      validators.map((validator) => async ({ stop, wasStopped }) => {
        if (validator === undefined) {
          return undefined;
        }

        if (wasReset() || wasStopped()) {
          stop();
          return undefined;
        }

        const result = await validate(validator, value, args);
        if (result.isValid) {
          stop();
        }

        return result;
      })
    );

    for (const result of results) {
      if (result !== undefined && result.isValid) {
        return validState;
      }
    }

    return { isValid: false, validationError };
  };
