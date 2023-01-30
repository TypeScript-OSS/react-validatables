import { waitFor } from '@testing-library/react';
import { useBinding } from 'react-bindings';

import { runInDom } from '../../../__test_dependency__';
import { defaultValidationError } from '../../../consts/default-validation-error';
import { selectValue } from '../../../transformers/generic/select-value';
import { useValidator } from '../../../use-validator/use-validator';
import { checkConditionally } from '../check-conditionally';
import { checkIf } from '../check-if';

describe('checkConditionally', () => {
  it('should work', () =>
    runInDom(({ onMount }) => {
      const mode = useBinding((): 'uppercase' | 'lowercase' => 'uppercase', { id: 'mode', detectChanges: true });
      const myBinding = useBinding(() => 'MiXed', { id: 'myBinding' });
      const isBindingValid = useValidator({ mode, myBinding }, ({ mode, myBinding }) =>
        selectValue(
          myBinding,
          checkConditionally(mode === 'lowercase', {
            if: checkIf((value) => value === value.toLocaleLowerCase()),
            else: checkIf((value) => value === value.toLocaleUpperCase())
          })
        )
      );

      expect(isBindingValid.value.get()?.isValid).toBeUndefined();
      expect(isBindingValid.isDisabled()).toBeFalsy();

      onMount(async () => {
        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(false));

        expect(isBindingValid.value.get()?.validationError).toBe(defaultValidationError);

        myBinding.set('HELLO');

        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(true));

        expect(isBindingValid.value.get()?.validationError).toBeUndefined();

        mode.set('lowercase');

        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(false));

        expect(isBindingValid.value.get()?.validationError).toBe(defaultValidationError);

        myBinding.set('hello');

        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(true));

        expect(isBindingValid.value.get()?.validationError).toBeUndefined();
      });
    }));
});
