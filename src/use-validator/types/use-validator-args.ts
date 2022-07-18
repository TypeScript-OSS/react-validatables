import type { BindingArrayDependencies, LimiterOptions, ReadonlyBinding } from 'react-bindings';

export interface UseValidatorArgs extends LimiterOptions {
  /** A technical, but human-readable ID, which isn't guaranteed to be unique */
  id?: string;

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
}
