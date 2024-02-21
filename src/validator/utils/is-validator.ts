import { isWaitable } from 'react-waitables';

import type { Validator } from '../types/validator';

/** Checks if the specified value is a validator */
export const isValidator = (value: any): value is Validator =>
  isWaitable(value) && value !== null && typeof value === 'object' && 'isValidator' in value && value.isValidator === true;
