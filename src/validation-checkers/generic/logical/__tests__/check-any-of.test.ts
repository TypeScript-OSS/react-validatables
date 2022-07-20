import { waitFor } from '@testing-library/react';
import { useBinding } from 'react-bindings';

import { runInDom } from '../../../../__test_dependency__';
import { defaultValidationError } from '../../../../consts/default-validation-error';
import { useValidator } from '../../../../use-validator/use-validator';
import { checkStringEmpty } from '../../../string/string-length';
import { checkEquals } from '../../equals';
import { checkAnyOf } from '../check-any-of';

describe('checkAnyOf', () => {
  it('should work', () =>
    runInDom(({ onMount }) => {
      const myBinding = useBinding(() => 'world', { id: 'myBinding' });
      const isBindingValid = useValidator(myBinding, () => checkAnyOf([checkStringEmpty(), checkEquals('hello')]), {
        id: 'myBindingValidator'
      });

      expect(isBindingValid.value.get()?.isValid).toBeUndefined();
      expect(isBindingValid.isDisabled()).toBeFalsy();

      onMount(async () => {
        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(false));

        expect(isBindingValid.value.get()?.validationError).toBe(defaultValidationError);

        myBinding.set('hello');

        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(true));

        expect(isBindingValid.value.get()?.validationError).toBeUndefined();

        myBinding.set('goodbye');

        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(false));

        expect(isBindingValid.value.get()?.validationError).toBe(defaultValidationError);
      });
    }));
});
