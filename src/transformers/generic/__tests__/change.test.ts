import { waitFor } from '@testing-library/react';
import { useBinding } from 'react-bindings';

import { runInDom } from '../../../__test_dependency__';
import { defaultValidationError } from '../../../consts/default-validation-error';
import { useValidator } from '../../../use-validator/use-validator';
import { checkStringNotEmpty } from '../../../validators/string/string-length';
import { change } from '../change';
import { preventNull } from '../nullish';

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
