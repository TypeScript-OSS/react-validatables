import type { TFunction } from 'i18next';
import type { TypeOrDeferredTypeWithArgs } from 'react-bindings';

export type ValidationError = TypeOrDeferredTypeWithArgs<string, [TFunction]>;
