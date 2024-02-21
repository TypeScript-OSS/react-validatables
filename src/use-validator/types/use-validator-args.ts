import type { DependencyList } from 'react';
import type { BindingArrayDependencies, LimiterOptions, ReadonlyBinding } from 'react-bindings';
import type { InferRequiredWaitableAndBindingValueTypes, TypeOrPromisedType, WaitableDependencies } from 'react-waitables';

import type { ValidationChecker, ValidationCheckerArgs } from '../../validator/types/validation-checker';

export interface UseValidatorArgs<DependenciesT extends WaitableDependencies> extends LimiterOptions {
  /** A technical, but human-readable ID, which isn't guaranteed to be unique */
  id?: string;
  /** On a rerender, deps changes are treated like hard reset bindings changes. */
  deps?: DependencyList;

  /**
   * If specified and the values of any of the specified bindings are not truthy, the validator is disabled and so it will always result in
   * "validity"
   */
  disabledUntil?: ReadonlyBinding | BindingArrayDependencies;
  /**
   * If specified and the values of any of the specified bindings are truthy, the validator is disabled and so it will always result in
   * "validity"
   */
  disabledWhile?: ReadonlyBinding | BindingArrayDependencies;
  /**
   * If any of the specified bindings are unmodified, the validator is disabled and so it will always result in "validity".
   *
   * Note: if updating the modification state of these bindings without updating their values, you will need to directly call `reset` on
   * this validator, or explicitly call `triggerChangeListeners` on the bindings, when ready to revalidate, since modification state changes
   * on bindings don't trigger change callbacks.
   */
  disabledWhileUnmodified?: ReadonlyBinding | BindingArrayDependencies;

  /** Extra validation that is only performed during finalization (see `finalizeValidation`) */
  extraFinalizationCheckers?: (
    dependencyValues: InferRequiredWaitableAndBindingValueTypes<DependenciesT>,
    dependencies: DependenciesT,
    args: ValidationCheckerArgs
  ) => TypeOrPromisedType<ValidationChecker<InferRequiredWaitableAndBindingValueTypes<DependenciesT>> | undefined>;
}
