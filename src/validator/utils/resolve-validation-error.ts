import type { TFunction } from 'i18next';

import type { ValidationError } from '../types/validation-error';

export function resolveValidationError(value: ValidationError, t: TFunction | void): string;
export function resolveValidationError(value: undefined, t: TFunction | void): undefined;
export function resolveValidationError(value: ValidationError | undefined, t: TFunction | void): string | undefined;
export function resolveValidationError(value: ValidationError | undefined, t: TFunction | void): string | undefined {
  return typeof value === 'string' ? value : value?.(t);
}
