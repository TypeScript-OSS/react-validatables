import { waitFor } from '@testing-library/react';
import { useBinding } from 'react-bindings';

import { runInDom } from '../../__test_dependency__';
import { defaultValidationError } from '../../consts/default-validation-error';
import { changeStringTrim } from '../../transformers/string/change-string-trim';
import { checkStringNotEmpty } from '../../validation-checkers/string/string-length';
import { useValidator } from '../use-validator';
import { useValidators } from '../use-validators';

describe('useValidators', () => {
  it('should combine validators using checkAllOf', () =>
    runInDom(({ onMount }) => {
      const a = useBinding(() => '', { id: 'test1' });
      const isAValid = useValidator(a, () => changeStringTrim(checkStringNotEmpty()), { id: 'isAValid' });

      const b = useBinding(() => '', { id: 'test2' });
      const isBValid = useValidator(b, () => changeStringTrim(checkStringNotEmpty()), { id: 'isBValid' });

      const formValidator = useValidators([isAValid, isBValid]);

      expect(formValidator.value.get()?.isValid).toBeUndefined();
      expect(formValidator.isDisabled()).toBeFalsy();

      onMount(async () => {
        await waitFor(() => expect(formValidator.value.get()?.isValid).toBe(false));

        expect(formValidator.value.get()?.validationError).toBe(defaultValidationError);

        a.set('hello');

        await waitFor(() => expect(isAValid.value.get()?.isValid).toBe(true));
        expect(formValidator.value.get()?.isValid).toBe(false);

        b.set('goodbye');

        await waitFor(() => expect(formValidator.value.get()?.isValid).toBe(true));

        expect(formValidator.value.get()?.validationError).toBeUndefined();
      });
    }));
});
