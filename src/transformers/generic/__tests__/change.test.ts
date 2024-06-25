import { waitFor } from '@testing-library/react';
import { useBinding } from 'react-bindings';

import { runInDom } from '../../../__test_dependency__/run-in-dom.js';
import { defaultValidationError } from '../../../consts/default-validation-error.js';
import { useValidator } from '../../../use-validator/use-validator.js';
import { checkStringNotEmpty } from '../../../validation-checkers/string/string-length.js';
import { change } from '../change.js';
import { preventNull } from '../nullish.js';

describe('change', () => {
  it('should work', () =>
    runInDom(({ onMount }) => {
      const myBinding = useBinding<string | null>(() => null, { id: 'myBinding' });
      const isBindingValid = useValidator(
        myBinding,
        () => preventNull(change((value) => value.replace(/[a-f]/gi, ''), checkStringNotEmpty())),
        { id: 'myBindingValidator' }
      );

      expect(isBindingValid.value.get()?.isValid).toBeUndefined();
      expect(isBindingValid.isDisabled()).toBeFalsy();

      onMount(async () => {
        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(false));

        expect(isBindingValid.value.get()?.validationError).toBe(defaultValidationError);

        myBinding.set('hello world');

        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(true));

        expect(isBindingValid.value.get()?.validationError).toBeUndefined();

        myBinding.set('FedBeef');

        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(false));

        expect(isBindingValid.value.get()?.validationError).toBe(defaultValidationError);
      });
    }));
});
