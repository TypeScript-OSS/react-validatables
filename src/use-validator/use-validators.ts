import { Validator } from '../validator/types/validator';
import { UseValidatorArgs } from './exports';
import { useValidator } from './use-validator';

/** A short-form of useValidator that can be used when simply combining multiple validators, such as for creating a form validator from a
 * collection of field validators */
export const useValidators = (validators: Array<Validator | undefined>, args: UseValidatorArgs = {}) =>
  useValidator(validators, (validators) => validators, args);
