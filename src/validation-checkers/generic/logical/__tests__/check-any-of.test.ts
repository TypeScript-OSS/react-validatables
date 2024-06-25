import { waitFor } from '@testing-library/react';
import { useBinding } from 'react-bindings';

import { runInDom } from '../../../../__test_dependency__/run-in-dom.js';
import { USE_FIRST_ERROR, USE_LAST_ERROR } from '../../../../consts/logical-validation-checkers.js';
import { useValidator } from '../../../../use-validator/use-validator.js';
import type { ValidationResult } from '../../../../validator/types/validation-result';
import { resolveValidationError } from '../../../../validator/utils/resolve-validation-error.js';
import { checkStringEmpty } from '../../../string/string-length.js';
import { checkEquals } from '../../equals.js';
import { checkAnyOf } from '../check-any-of.js';

describe('checkAnyOf', () => {
  it('should work', () =>
    runInDom(({ onMount }) => {
      const myBinding = useBinding(() => 'world', { id: 'myBinding' });
      const isBindingValid = useValidator(myBinding, () => checkAnyOf([checkStringEmpty(), checkEquals('hello')], 'nope'), {
        id: 'myBindingValidator'
      });

      expect(isBindingValid.value.get()?.isValid).toBeUndefined();
      expect(isBindingValid.isDisabled()).toBeFalsy();

      onMount(async () => {
        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(false));

        expect(isBindingValid.value.get()?.validationError).toBe('nope');

        myBinding.set('hello');

        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(true));

        expect(isBindingValid.value.get()?.validationError).toBeUndefined();

        myBinding.set('goodbye');

        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(false));

        expect(isBindingValid.value.get()?.validationError).toBe('nope');
      });
    }));

  it('should work with validationError="use-first-error"', () =>
    runInDom(({ onMount }) => {
      const myBinding = useBinding(() => 'world', { id: 'myBinding' });
      const isBindingValid = useValidator(
        myBinding,
        () => checkAnyOf([checkStringEmpty('can be empty'), checkEquals('hello', 'can be hello')], USE_FIRST_ERROR),
        { id: 'myBindingValidator' }
      );

      expect(isBindingValid.value.get()?.isValid).toBeUndefined();
      expect(isBindingValid.isDisabled()).toBeFalsy();

      onMount(async () => {
        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(false));

        expect(isBindingValid.value.get()?.validationError).toBe('can be empty');

        myBinding.set('hello');

        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(true));

        expect(isBindingValid.value.get()?.validationError).toBeUndefined();

        myBinding.set('goodbye');

        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(false));

        expect(isBindingValid.value.get()?.validationError).toBe('can be empty');
      });
    }));

  it('should work with validationError="use-last-error"', () =>
    runInDom(({ onMount }) => {
      const myBinding = useBinding(() => 'world', { id: 'myBinding' });
      const isBindingValid = useValidator(
        myBinding,
        () => checkAnyOf([checkStringEmpty('can be empty'), checkEquals('hello', 'can be hello')], USE_LAST_ERROR),
        { id: 'myBindingValidator' }
      );

      expect(isBindingValid.value.get()?.isValid).toBeUndefined();
      expect(isBindingValid.isDisabled()).toBeFalsy();

      onMount(async () => {
        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(false));

        expect(isBindingValid.value.get()?.validationError).toBe('can be hello');

        myBinding.set('hello');

        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(true));

        expect(isBindingValid.value.get()?.validationError).toBeUndefined();

        myBinding.set('goodbye');

        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(false));

        expect(isBindingValid.value.get()?.validationError).toBe('can be hello');
      });
    }));

  it('should work with deferred validationError', () =>
    runInDom(({ onMount }) => {
      const myBinding = useBinding(() => 'world', { id: 'myBinding' });
      const isBindingValid = useValidator(
        myBinding,
        () =>
          checkAnyOf([checkStringEmpty('can be empty'), checkEquals('hello', 'can be hello')], (t, results) =>
            (results.filter((result) => result !== undefined && !result.isValid) as Array<ValidationResult & { isValid: false }>)
              .map((result) => resolveValidationError(result.validationError, t))
              .join(' OR ')
          ),
        { id: 'myBindingValidator' }
      );

      expect(isBindingValid.value.get()?.isValid).toBeUndefined();
      expect(isBindingValid.isDisabled()).toBeFalsy();

      onMount(async () => {
        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(false));

        expect(resolveValidationError(isBindingValid.value.get()?.validationError)).toBe('can be empty OR can be hello');

        myBinding.set('hello');

        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(true));

        expect(isBindingValid.value.get()?.validationError).toBeUndefined();

        myBinding.set('goodbye');

        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(false));

        expect(resolveValidationError(isBindingValid.value.get()?.validationError)).toBe('can be empty OR can be hello');
      });
    }));
});
