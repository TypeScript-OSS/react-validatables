import { waitFor } from '@testing-library/react';
import { useBinding } from 'react-bindings';

import { runInDom } from '../../../__test_dependency__';
import { defaultValidationError } from '../../../consts/default-validation-error';
import { useValidator } from '../../../use-validator/use-validator';
import { checkNumberGT } from '../../../validation-checkers/number/range';
import { selectValue } from '../select-value';

describe('selectValue', () => {
  it('should work', () =>
    runInDom(({ onMount }) => {
      const myBinding = useBinding<string | null>(() => null, { id: 'myBinding' });
      const isBindingValid = useValidator(myBinding, () => selectValue(3, checkNumberGT(5)), { id: 'myBindingValidator' });

      expect(isBindingValid.value.get()?.isValid).toBeUndefined();
      expect(isBindingValid.isDisabled()).toBeFalsy();

      onMount(async () => {
        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(false));

        expect(isBindingValid.value.get()?.validationError).toBe(defaultValidationError);
      });
    }));
});
