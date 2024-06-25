import { waitFor } from '@testing-library/react';
import { useBinding } from 'react-bindings';

import { runInDom } from '../../../__test_dependency__/run-in-dom.js';
import { defaultValidationError } from '../../../consts/default-validation-error.js';
import { useValidator } from '../../../use-validator/use-validator.js';
import { checkNumberGT, checkNumberGTE, checkNumberLT, checkNumberLTE } from '../range.js';

describe('checkNumberGT', () => {
  it('should work', () =>
    runInDom(({ onMount }) => {
      const myBinding = useBinding(() => 0, { id: 'myBinding' });
      const isBindingValid = useValidator(myBinding, () => checkNumberGT(25), { id: 'myBindingValidator' });

      expect(isBindingValid.value.get()?.isValid).toBeUndefined();
      expect(isBindingValid.isDisabled()).toBeFalsy();

      onMount(async () => {
        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(false));

        expect(isBindingValid.value.get()?.validationError).toBe(defaultValidationError);

        myBinding.set(26);

        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(true));

        expect(isBindingValid.value.get()?.validationError).toBeUndefined();

        myBinding.set(25);

        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(false));

        expect(isBindingValid.value.get()?.validationError).toBe(defaultValidationError);
      });
    }));
});

describe('checkNumberGTE', () => {
  it('should work', () =>
    runInDom(({ onMount }) => {
      const myBinding = useBinding(() => 0, { id: 'myBinding' });
      const isBindingValid = useValidator(myBinding, () => checkNumberGTE(25), { id: 'myBindingValidator' });

      expect(isBindingValid.value.get()?.isValid).toBeUndefined();
      expect(isBindingValid.isDisabled()).toBeFalsy();

      onMount(async () => {
        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(false));

        expect(isBindingValid.value.get()?.validationError).toBe(defaultValidationError);

        myBinding.set(25);

        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(true));

        expect(isBindingValid.value.get()?.validationError).toBeUndefined();

        myBinding.set(24.99);

        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(false));

        expect(isBindingValid.value.get()?.validationError).toBe(defaultValidationError);
      });
    }));
});

describe('checkNumberLT', () => {
  it('should work', () =>
    runInDom(({ onMount }) => {
      const myBinding = useBinding(() => 26, { id: 'myBinding' });
      const isBindingValid = useValidator(myBinding, () => checkNumberLT(25), { id: 'myBindingValidator' });

      expect(isBindingValid.value.get()?.isValid).toBeUndefined();
      expect(isBindingValid.isDisabled()).toBeFalsy();

      onMount(async () => {
        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(false));

        expect(isBindingValid.value.get()?.validationError).toBe(defaultValidationError);

        myBinding.set(0);

        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(true));

        expect(isBindingValid.value.get()?.validationError).toBeUndefined();

        myBinding.set(27);

        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(false));

        expect(isBindingValid.value.get()?.validationError).toBe(defaultValidationError);
      });
    }));
});

describe('checkNumberLTE', () => {
  it('should work', () =>
    runInDom(({ onMount }) => {
      const myBinding = useBinding(() => 26, { id: 'myBinding' });
      const isBindingValid = useValidator(myBinding, () => checkNumberLTE(25), { id: 'myBindingValidator' });

      expect(isBindingValid.value.get()?.isValid).toBeUndefined();
      expect(isBindingValid.isDisabled()).toBeFalsy();

      onMount(async () => {
        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(false));

        expect(isBindingValid.value.get()?.validationError).toBe(defaultValidationError);

        myBinding.set(25);

        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(true));

        expect(isBindingValid.value.get()?.validationError).toBeUndefined();

        myBinding.set(25.01);

        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(false));

        expect(isBindingValid.value.get()?.validationError).toBe(defaultValidationError);
      });
    }));
});
