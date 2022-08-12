import type { Binding } from 'react-bindings';

export type MutableBindingArrayDependencies = Array<Binding | undefined> | [Binding];

export type NamedMutableBindingDependencies = Record<string, Binding | undefined>;

export type MutableBindingDependencies = Binding | MutableBindingArrayDependencies | NamedMutableBindingDependencies | undefined;
