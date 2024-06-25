import { waitFor } from '@testing-library/react';
import { useBinding } from 'react-bindings';

import { runInDom } from '../../__test_dependency__/run-in-dom.js';
import { preventUndefined } from '../../transformers/generic/nullish.js';
import { changeStringTrim } from '../../transformers/string/change-string-trim.js';
import { checkAllOf } from '../../validation-checkers/generic/logical/check-all-of.js';
import { checkAnyOf } from '../../validation-checkers/generic/logical/check-any-of.js';
import { checkNumberIsInteger } from '../../validation-checkers/number/divisor.js';
import { checkNumberGTE, checkNumberLT } from '../../validation-checkers/number/range.js';
import { checkStringNotEmpty } from '../../validation-checkers/string/string-length.js';
import { useValidator } from '../use-validator.js';

describe('useValidator', () => {
  it('validators should be chained properly', () =>
    runInDom(({ onMount }) => {
      const makeNamePartValidator = () => changeStringTrim(checkStringNotEmpty());

      const firstName = useBinding(() => '', { id: 'firstName', detectChanges: true });
      const firstNameValidator = useValidator(firstName, makeNamePartValidator);

      const lastName = useBinding(() => '', { id: 'lastName', detectChanges: true });
      const lastNameValidator = useValidator(lastName, makeNamePartValidator);

      const nameValidator = useValidator([firstNameValidator, lastNameValidator], (validators) =>
        checkAnyOf(validators, 'First name, last name, or both must be specified')
      );

      const age = useBinding<number | undefined>(() => undefined, { id: 'age', detectChanges: true });
      const ageValidator = useValidator(age, () =>
        preventUndefined(
          [
            checkNumberIsInteger("Fractional values aren't allowed"),
            checkNumberGTE(0, 'Must be >= 0'),
            checkNumberLT(200, 'Must be < 200')
          ],
          'Age is required'
        )
      );

      const formValidator = useValidator([nameValidator, ageValidator], (validators) => checkAllOf(validators));

      expect(formValidator.value.get()?.isValid).toBeUndefined();
      expect(formValidator.isDisabled()).toBeFalsy();

      onMount(async () => {
        await waitFor(() => expect(formValidator.value.get()?.isValid).toBe(false));

        expect(formValidator.value.get()?.validationError).toBe('First name, last name, or both must be specified');

        firstName.set('hello');

        await waitFor(() => expect(formValidator.value.get()?.validationError).toBe('Age is required'));

        age.set(3);

        await waitFor(() => expect(formValidator.value.get()?.isValid).toBe(true));
      });
    }));
});
