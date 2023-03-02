import type { Validator } from '../validator/types/validator';
import type { UseValidatorArgs } from './types/use-validator-args';
import { useValidator } from './use-validator';

/** A short-form of useValidator that can be used when simply combining multiple validators, such as for creating a form validator from a
 * collection of field validators */
export const useValidators = (validators: Array<Validator | undefined>, args: UseValidatorArgs = {}) =>
  useValidator(validators, (validators) => validators, args);
