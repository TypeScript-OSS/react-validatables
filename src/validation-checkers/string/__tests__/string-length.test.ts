import { waitFor } from '@testing-library/react';
import { useBinding } from 'react-bindings';

import { runInDom } from '../../../__test_dependency__/run-in-dom.js';
import { defaultValidationError } from '../../../consts/default-validation-error.js';
import { useValidator } from '../../../use-validator/use-validator.js';
import {
  checkStringAtLeastChars,
  checkStringAtMostChars,
  checkStringEmpty,
  checkStringLength,
  checkStringNotEmpty
} from '../string-length.js';

describe('checkStringEmpty', () => {
  it('should work with single values', () =>
    runInDom(({ onMount }) => {
      const myBinding = useBinding(() => 'hello', { id: 'myBinding' });
      const isBindingValid = useValidator(myBinding, () => checkStringEmpty(), { id: 'myBindingValidator' });

      expect(isBindingValid.value.get()?.isValid).toBeUndefined();
      expect(isBindingValid.isDisabled()).toBeFalsy();

      onMount(async () => {
        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(false));

        expect(isBindingValid.value.get()?.validationError).toBe(defaultValidationError);

        myBinding.set('');

        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(true));

        expect(isBindingValid.value.get()?.validationError).toBeUndefined();
      });
    }));
});

describe('checkStringNotEmpty', () => {
  it('should work with single values', () =>
    runInDom(({ onMount }) => {
      const myBinding = useBinding(() => '', { id: 'myBinding' });
      const isBindingValid = useValidator(myBinding, () => checkStringNotEmpty(), { id: 'myBindingValidator' });

      expect(isBindingValid.value.get()?.isValid).toBeUndefined();
      expect(isBindingValid.isDisabled()).toBeFalsy();

      onMount(async () => {
        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(false));

        expect(isBindingValid.value.get()?.validationError).toBe(defaultValidationError);

        myBinding.set('hello');

        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(true));

        expect(isBindingValid.value.get()?.validationError).toBeUndefined();
      });
    }));
});

describe('checkStringAtLeastChars', () => {
  it('should work with single values', () =>
    runInDom(({ onMount }) => {
      const myBinding = useBinding(() => 'hi', { id: 'myBinding' });
      const isBindingValid = useValidator(myBinding, () => checkStringAtLeastChars(3), { id: 'myBindingValidator' });

      expect(isBindingValid.value.get()?.isValid).toBeUndefined();
      expect(isBindingValid.isDisabled()).toBeFalsy();

      onMount(async () => {
        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(false));

        expect(isBindingValid.value.get()?.validationError).toBe(defaultValidationError);

        myBinding.set('hello');

        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(true));

        expect(isBindingValid.value.get()?.validationError).toBeUndefined();
      });
    }));
});

describe('checkStringAtMostChars', () => {
  it('should work with single values', () =>
    runInDom(({ onMount }) => {
      const myBinding = useBinding(() => 'hello', { id: 'myBinding' });
      const isBindingValid = useValidator(myBinding, () => checkStringAtMostChars(2), { id: 'myBindingValidator' });

      expect(isBindingValid.value.get()?.isValid).toBeUndefined();
      expect(isBindingValid.isDisabled()).toBeFalsy();

      onMount(async () => {
        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(false));

        expect(isBindingValid.value.get()?.validationError).toBe(defaultValidationError);

        myBinding.set('hi');

        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(true));

        expect(isBindingValid.value.get()?.validationError).toBeUndefined();
      });
    }));
});

describe('checkStringLength', () => {
  it('should work with single values', () =>
    runInDom(({ onMount }) => {
      const myBinding = useBinding(() => 'hello', { id: 'myBinding' });
      const isBindingValid = useValidator(myBinding, () => checkStringLength(2), { id: 'myBindingValidator' });

      expect(isBindingValid.value.get()?.isValid).toBeUndefined();
      expect(isBindingValid.isDisabled()).toBeFalsy();

      onMount(async () => {
        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(false));

        expect(isBindingValid.value.get()?.validationError).toBe(defaultValidationError);

        myBinding.set('hi');

        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(true));

        expect(isBindingValid.value.get()?.validationError).toBeUndefined();
      });
    }));
});
