import { waitFor } from '@testing-library/react';
import { useBinding } from 'react-bindings';

import { runInDom } from '../../../../__test_dependency__/run-in-dom.js';
import { defaultValidationError } from '../../../../consts/default-validation-error.js';
import { useValidator } from '../../../../use-validator/use-validator.js';
import { checkStringEmpty } from '../../../string/string-length.js';
import { checkEquals } from '../../equals.js';
import { checkNoneOf } from '../check-none-of.js';

describe('checkNoneOf', () => {
  it('should work', () =>
    runInDom(({ onMount }) => {
      const myBinding = useBinding(() => '', { id: 'myBinding' });
      const isBindingValid = useValidator(myBinding, () => checkNoneOf([checkStringEmpty(), checkEquals('hello')]), {
        id: 'myBindingValidator'
      });

      expect(isBindingValid.value.get()?.isValid).toBeUndefined();
      expect(isBindingValid.isDisabled()).toBeFalsy();

      onMount(async () => {
        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(false));

        expect(isBindingValid.value.get()?.validationError).toBe(defaultValidationError);

        myBinding.set('world');

        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(true));

        expect(isBindingValid.value.get()?.validationError).toBeUndefined();

        myBinding.set('hello');

        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(false));

        expect(isBindingValid.value.get()?.validationError).toBe(defaultValidationError);
      });
    }));
});
