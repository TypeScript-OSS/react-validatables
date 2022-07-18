import { Binding, EmptyObject, InferBindingValueTypes, isBinding, lockBindingsAndDo, TypeOrDeferredType } from 'react-bindings';
import { Waitable } from 'react-waitables';

import { normalizeAsArray } from '../internal-utils/array-like';
import { extractBindingDependencyValues } from '../internal-utils/extract-binding-dependency-values';
import {
  MutableBindingArrayDependencies,
  MutableBindingDependencies,
  NamedMutableBindingDependencies
} from '../types/mutable-binding-dependencies';
import { ValidationResult } from '../types/validation-result';

const emptyDependencies = Object.freeze({} as EmptyObject);

/**
 * Marks all specified bindings as "modified", locks them, and then waits for the specified validator to finish.
 *
 * This is generally used for form-level validation before, for example, submitting to a server.
 *
 * The appropriate callback will be made once the validator is finished.
 *
 * @returns A function that can be used to cancel the validation
 */
export const finalizeValidation = <DependenciesT extends MutableBindingDependencies = Record<string, never>>(
  validator: Waitable<ValidationResult>,
  {
    bindings,
    onInvalid,
    onValid
  }: {
    bindings?: DependenciesT;
    onInvalid?: (
      bindingValues: InferBindingValueTypes<DependenciesT>,
      bindings: DependenciesT,
      validationError: TypeOrDeferredType<string>
    ) => void;
    onValid?: (bindingValues: InferBindingValueTypes<DependenciesT>, bindings: DependenciesT) => void;
  }
) => {
  const isNonNamedBindings = Array.isArray(bindings) || isBinding(bindings);
  const nonNamedBindings = isNonNamedBindings ? (bindings as Binding | MutableBindingArrayDependencies) : undefined;
  const namedBindings = isNonNamedBindings ? undefined : (bindings as NamedMutableBindingDependencies);
  const namedBindingsKeys = namedBindings !== undefined ? Object.keys(namedBindings) : undefined;
  const allBindings = isNonNamedBindings ? normalizeAsArray(nonNamedBindings) : Object.values(namedBindings ?? emptyDependencies);

  // Marking any bindings that aren't already marked as modified as modified, so their validators will run if they're associated validators
  // are setup disabledWhileUnmodifiedBindings
  for (const binding of allBindings) {
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
  const getDependencyValues = () => extractBindingDependencyValues({ bindings, namedBindingsKeys });

  setTimeout(async () => {
    if (wasCanceled) {
      return;
    }

    const dependencies = bindings ?? (emptyDependencies as DependenciesT);

    const result = await lockBindingsAndDo(allBindings, async () => {
      // If the validator is already ready, trigger the callbacks right away
      let validationResult = validator.value.get();
      if (validationResult !== undefined) {
        return {
          bindingValues: getDependencyValues(),
          validationResult
        };
      }

      // Otherwise wait for the result.  Because we call triggerChangeListeners on the unmodified bindings above, one or more resets may occur
      // on the validator, which we want to ignore
      let waitResult = await validator.wait();
      while (!wasCanceled && waitResult === 'reset') {
        waitResult = await validator.wait();
      }

      if (waitResult === 'failure') {
        return undefined;
      }

      validationResult = validator.value.get();
      if (validationResult !== undefined) {
        return { bindingValues: getDependencyValues(), validationResult };
      }

      return undefined;
    });

    if (result !== undefined) {
      const { bindingValues, validationResult } = result;

      if (validationResult.isValid) {
        onValid?.(bindingValues, dependencies);
      } else {
        onInvalid?.(bindingValues, dependencies, validationResult.validationError);
      }
    }
  }, 0);

  return cancel;
};
