import { Binding, EmptyObject, InferBindingValueTypes, isBinding, lockBindingsAndDo } from 'react-bindings';
import { InferOptionalWaitableAndBindingValueTypes, isWaitable, TypeOrPromisedType, WaitableDependencies } from 'react-waitables';

import { normalizeAsArray } from '../internal-utils/array-like';
import { extractBindingDependencyValues } from '../internal-utils/extract-binding-dependency-values';
import { extractOptionalWaitableDependencyValues } from '../internal-utils/extract-waitable-dependency-values';
import { getTypedKeys } from '../internal-utils/get-typed-keys';
import {
  MutableBindingArrayDependencies,
  MutableBindingDependencies,
  NamedMutableBindingDependencies
} from '../types/mutable-binding-dependencies';
import type { ValidationError } from '../validator/types/validation-error';
import type { ValidationResult } from '../validator/types/validation-result';
import type { Validator } from '../validator/types/validator';

const emptyDependencies = Object.freeze({} as EmptyObject);

export interface FinalizeValidationOptions<
  FieldBindingsT extends MutableBindingDependencies = Record<string, never>,
  AdditionalDependenciesT extends WaitableDependencies = Record<string, never>
> {
  /** Bindings that, when unmodfied, cause validators to be disabled.  Usually individual field bindings. */
  fieldBindings?: FieldBindingsT;

  /** Additional dependencies, which must not overlap `markBindingsAsModified` */
  additionalDependencies?: AdditionalDependenciesT;

  /** Called if the validator results in "invalidity" */
  onInvalid?: (
    validationError: ValidationError,
    fieldBindingValues: InferBindingValueTypes<FieldBindingsT>,
    additionalDependencyValues: InferOptionalWaitableAndBindingValueTypes<AdditionalDependenciesT>,
    fieldBindings: FieldBindingsT,
    additionalDependencies: AdditionalDependenciesT
  ) => void;

  /** Called if the validator results in "validity" */
  onValid?: (
    fieldBindingValues: InferBindingValueTypes<FieldBindingsT>,
    additionalDependencyValues: InferOptionalWaitableAndBindingValueTypes<AdditionalDependenciesT>,
    fieldBindings: FieldBindingsT,
    additionalDependencies: AdditionalDependenciesT
  ) => void;
}

export interface FinalizeValidationResult {
  /** Call to cancel the validation request */
  cancel: () => void;

  /** The promised result, which may be undefined if canceled or if an error occurred */
  validationResult: TypeOrPromisedType<ValidationResult | undefined>;
}

/**
 * Generally used for final "form" validation before submitting data to a server, this:
 *
 * - marks field bindings as modified
 * - for any previously-unmodified bindings, artificially triggers a change listener callback
 * - locks the field bindings
 * - waits for the validators to complete
 *
 * @returns A function that can be used to cancel the requested validation and a promised validation result.
 */
export const finalizeValidation = <
  FieldBindingsT extends MutableBindingDependencies = Record<string, never>,
  AdditionalDependenciesT extends WaitableDependencies = Record<string, never>
>(
  formValidator: Validator,
  { fieldBindings, additionalDependencies, onInvalid, onValid }: FinalizeValidationOptions<FieldBindingsT, AdditionalDependenciesT> = {}
): FinalizeValidationResult => {
  const isNonNamedFieldBindings = Array.isArray(fieldBindings) || isBinding(fieldBindings);
  const nonNamedFieldBindings = isNonNamedFieldBindings ? (fieldBindings as Binding | MutableBindingArrayDependencies) : undefined;
  const namedFieldBindings = isNonNamedFieldBindings ? undefined : (fieldBindings as NamedMutableBindingDependencies);
  const namedFieldBindingsKeys = namedFieldBindings !== undefined ? getTypedKeys(namedFieldBindings) : undefined;
  const allFieldBindings = isNonNamedFieldBindings
    ? normalizeAsArray(nonNamedFieldBindings)
    : Object.values(namedFieldBindings ?? emptyDependencies);

  const isNonNamedDependencies =
    Array.isArray(additionalDependencies) || isWaitable(additionalDependencies) || isBinding(additionalDependencies);
  const namedDependencies = isNonNamedDependencies ? undefined : additionalDependencies;
  const namedAdditionalDependencyKeys = namedDependencies !== undefined ? getTypedKeys(namedDependencies) : undefined;

  // Marking any bindings that aren't already marked as modified as modified, so their validators will run if they're associated validators
  // are setup disabledWhileUnmodifiedBindings
  for (const binding of allFieldBindings) {
    if (binding !== undefined && !binding.isModified()) {
      binding.setIsModified(true);
      binding.triggerChangeListeners();
    }
  }

  let wasCanceled = false;
  const cancel = () => {
    wasCanceled = true;
  };

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  const getAdditionalDependencyValues = () =>
    extractOptionalWaitableDependencyValues({ dependencies: additionalDependencies, namedDependencyKeys: namedAdditionalDependencyKeys });

  const getFieldBindingValues = () =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    extractBindingDependencyValues({ bindings: fieldBindings, namedBindingsKeys: namedFieldBindingsKeys });

  const triggerCallbacks = (validationResult: ValidationResult) => {
    const fieldBindingValues = getFieldBindingValues();
    const additionalDependencyValues = getAdditionalDependencyValues().values;

    setTimeout(() => {
      if (validationResult.isValid) {
        onValid?.(
          fieldBindingValues,
          additionalDependencyValues,
          fieldBindings ?? (emptyDependencies as FieldBindingsT),
          additionalDependencies ?? (emptyDependencies as AdditionalDependenciesT)
        );
      } else {
        onInvalid?.(
          validationResult.validationError,
          fieldBindingValues,
          additionalDependencyValues,
          fieldBindings ?? (emptyDependencies as FieldBindingsT),
          additionalDependencies ?? (emptyDependencies as AdditionalDependenciesT)
        );
      }
    }, 0);

    return validationResult;
  };

  const validationResult = lockBindingsAndDo(allFieldBindings, async () => {
    if (wasCanceled) {
      return;
    }

    // If the validator is already ready, trigger the callbacks right away
    let validationResult = formValidator.value.get();
    if (validationResult !== undefined) {
      return triggerCallbacks(validationResult);
    }

    // Otherwise wait for the result.  Because we call triggerChangeListeners on the unmodified bindings above, one or more resets may occur
    // on the validator, which we want to ignore
    const waitResult = await formValidator.wait({ continueWaitingOnReset: () => !wasCanceled });

    if (waitResult === 'failure') {
      return undefined;
    }

    validationResult = formValidator.value.get();
    if (validationResult !== undefined) {
      return triggerCallbacks(validationResult);
    }

    return undefined;
  });

  return { cancel, validationResult };
};
