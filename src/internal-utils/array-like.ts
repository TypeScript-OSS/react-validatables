import type { SingleOrArray } from 'react-bindings';

/** Normalizes a SingleOrArray value as an array */
export const normalizeAsArray = <T>(value: SingleOrArray<T>) => (Array.isArray(value) ? value : [value]);
