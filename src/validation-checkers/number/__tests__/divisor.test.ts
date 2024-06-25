import { waitFor } from '@testing-library/react';
import { useBinding } from 'react-bindings';

import { runInDom } from '../../../__test_dependency__/run-in-dom.js';
import { defaultValidationError } from '../../../consts/default-validation-error.js';
import { useValidator } from '../../../use-validator/use-validator.js';
import { checkNumberDivisibleBy, checkNumberIsInteger, checkNumberNotDivisibleBy } from '../divisor.js';

describe('checkNumberDivisibleBy', () => {
  it('should work with single values', () =>
    runInDom(({ onMount }) => {
      const myBinding = useBinding(() => 0, { id: 'myBinding' });
      const isBindingValid = useValidator(myBinding, () => checkNumberDivisibleBy(2), { id: 'myBindingValidator' });

      expect(isBindingValid.value.get()?.isValid).toBeUndefined();
      expect(isBindingValid.isDisabled()).toBeFalsy();

      onMount(async () => {
        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(true));

        expect(isBindingValid.value.get()?.validationError).toBeUndefined();

        myBinding.set(3);

        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(false));

        expect(isBindingValid.value.get()?.validationError).toBe(defaultValidationError);
      });
    }));

  it('should work with arrays', () =>
    runInDom(({ onMount }) => {
      const myBinding = useBinding(() => 0, { id: 'myBinding' });
      const isBindingValid = useValidator(myBinding, () => checkNumberDivisibleBy([2, 7]), { id: 'myBindingValidator' });

      expect(isBindingValid.value.get()?.isValid).toBeUndefined();
      expect(isBindingValid.isDisabled()).toBeFalsy();

      onMount(async () => {
        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(true));

        expect(isBindingValid.value.get()?.validationError).toBeUndefined();

        myBinding.set(3);

        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(false));

        expect(isBindingValid.value.get()?.validationError).toBe(defaultValidationError);

        myBinding.set(14);

        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(true));

        expect(isBindingValid.value.get()?.validationError).toBeUndefined();
      });
    }));
});

describe('checkNumberNotDivisibleBy', () => {
  it('should work with single values', () =>
    runInDom(({ onMount }) => {
      const myBinding = useBinding(() => 0, { id: 'myBinding' });
      const isBindingValid = useValidator(myBinding, () => checkNumberNotDivisibleBy(2), { id: 'myBindingValidator' });

      expect(isBindingValid.value.get()?.isValid).toBeUndefined();
      expect(isBindingValid.isDisabled()).toBeFalsy();

      onMount(async () => {
        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(false));

        expect(isBindingValid.value.get()?.validationError).toBe(defaultValidationError);

        myBinding.set(3);

        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(true));

        expect(isBindingValid.value.get()?.validationError).toBeUndefined();
      });
    }));

  it('should work with arrays', () =>
    runInDom(({ onMount }) => {
      const myBinding = useBinding(() => 0, { id: 'myBinding' });
      const isBindingValid = useValidator(myBinding, () => checkNumberNotDivisibleBy([2, 7]), { id: 'myBindingValidator' });

      expect(isBindingValid.value.get()?.isValid).toBeUndefined();
      expect(isBindingValid.isDisabled()).toBeFalsy();

      onMount(async () => {
        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(false));

        expect(isBindingValid.value.get()?.validationError).toBe(defaultValidationError);

        myBinding.set(3);

        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(true));

        expect(isBindingValid.value.get()?.validationError).toBeUndefined();

        myBinding.set(14);

        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(false));

        expect(isBindingValid.value.get()?.validationError).toBe(defaultValidationError);
      });
    }));
});

describe('checkNumberIsInteger', () => {
  it('should work ', () =>
    runInDom(({ onMount }) => {
      const myBinding = useBinding(() => 0, { id: 'myBinding' });
      const isBindingValid = useValidator(myBinding, () => checkNumberIsInteger(), { id: 'myBindingValidator' });

      expect(isBindingValid.value.get()?.isValid).toBeUndefined();
      expect(isBindingValid.isDisabled()).toBeFalsy();

      onMount(async () => {
        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(true));

        expect(isBindingValid.value.get()?.validationError).toBeUndefined();

        myBinding.set(3.14);

        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(false));

        expect(isBindingValid.value.get()?.validationError).toBe(defaultValidationError);

        myBinding.set(5);

        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(true));

        expect(isBindingValid.value.get()?.validationError).toBeUndefined();
      });
    }));
});
