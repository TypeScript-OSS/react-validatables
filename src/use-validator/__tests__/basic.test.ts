import { waitFor } from '@testing-library/react';
import { useBinding } from 'react-bindings';

import { runInDom } from '../../__test_dependency__/run-in-dom.js';
import { defaultValidationError } from '../../consts/default-validation-error.js';
import { changeStringTrim } from '../../transformers/string/change-string-trim.js';
import { checkStringNotEmpty } from '../../validation-checkers/string/string-length.js';
import { useValidator } from '../use-validator.js';

describe('useValidator', () => {
  it('should be initially undetermined then should be valid or invalid appropriately', () =>
    runInDom(({ onMount }) => {
      const myBinding = useBinding(() => '', { id: 'myBinding' });
      const isBindingValid = useValidator(myBinding, () => changeStringTrim(checkStringNotEmpty()), { id: 'myBindingValidator' });

      expect(isBindingValid.value.get()?.isValid).toBeUndefined();
      expect(isBindingValid.isDisabled()).toBeFalsy();

      onMount(async () => {
        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(false));

        expect(isBindingValid.value.get()?.validationError).toBe(defaultValidationError);

        myBinding.set('hello');

        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(true));

        expect(isBindingValid.value.get()?.validationError).toBeUndefined();

        myBinding.set('');

        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(false));

        expect(isBindingValid.value.get()?.validationError).toBe(defaultValidationError);

        myBinding.set(' hello ');

        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(true));

        expect(isBindingValid.value.get()?.validationError).toBeUndefined();

        myBinding.set(' ');

        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(false));

        expect(isBindingValid.value.get()?.validationError).toBe(defaultValidationError);
      });
    }));
});
