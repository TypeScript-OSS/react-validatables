import type { SingleOrArray } from 'react-bindings';

import { defaultValidationError } from '../../consts/default-validation-error';
import type { ValidatorCheckerFunction } from '../../validator/types/validation-checker';
import type { ValidationError } from '../../validator/types/validation-error';
import { checkIf } from '../generic/check-if';

/** Results in "validity" for any number evenly divisible by any of the specified divisors */
export const checkNumberDivisibleBy = (
  oneOf: SingleOrArray<number>,
  validationError: ValidationError = defaultValidationError
): ValidatorCheckerFunction<number> =>
  checkIf(
    (value) => (Array.isArray(oneOf) ? oneOf.find((divisor) => value % divisor === 0) !== undefined : value % oneOf === 0),
    validationError
  );

/** Results in "validity" for any number not evenly divisible by any of the specified divisors */
export const checkNumberNotDivisibleBy = (
  anyOf: SingleOrArray<number>,
  validationError: ValidationError = defaultValidationError
): ValidatorCheckerFunction<number> =>
  checkIf(
    (value) => (Array.isArray(anyOf) ? anyOf.find((divisor) => value % divisor === 0) === undefined : value % anyOf !== 0),
    validationError
  );

/** Results in "validity" for any integer number, which is evenly divisible by 1.  That is, by checking `value % 1 === 0` */
export const checkNumberIsInteger = (validationError: ValidationError = defaultValidationError): ValidatorCheckerFunction<number> =>
  checkIf((value) => value % 1 === 0, validationError);
