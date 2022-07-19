import { waitFor } from '@testing-library/react';
import { useBinding } from 'react-bindings';

import { runInDom, sleep } from '../../../../__test_dependency__';
import { validState } from '../../../../consts/basic-validation-results';
import { defaultValidationError } from '../../../../consts/default-validation-error';
import { useValidator } from '../../../../use-validator/use-validator';
import type { ValidationChecker, ValidatorCheckerFunction } from '../../../../validator/types/validation-checker';
import { checkStringNotEmpty } from '../../../string/string-length';
import { checkNotEquals } from '../../equals';
import { checkAllOf, checkValidity } from '../check-all-of';

describe('checkAllOf', () => {
  it('should work', () =>
    runInDom(({ onMount }) => {
      const myBinding = useBinding(() => '', { id: 'myBinding' });
      const isBindingValid = useValidator(myBinding, () => checkAllOf([checkStringNotEmpty(), checkNotEquals('hello')]), {
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

  it('should work using implied checkAllOf', () =>
    runInDom(({ onMount }) => {
      const myBinding = useBinding(() => '', { id: 'myBinding' });
      const isBindingValid = useValidator(myBinding, () => [checkStringNotEmpty(), checkNotEquals('hello')], {
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

  it('should work if the value changes multiple times', () =>
    runInDom(({ onMount }) => {
      const myBinding = useBinding(() => '', { id: 'myBinding' });

      let numResets = 0;
      const wrapValidator = (checker: ValidationChecker<string>): ValidatorCheckerFunction<string> =>
        jest.fn(async (value, args) => {
          await sleep(10);
          if (args.wasReset()) {
            numResets += 1;
            return validState;
          }

          return checkValidity(checker, value, args);
        });
      const wrappedValidator = wrapValidator(checkAllOf([checkStringNotEmpty(), checkNotEquals('hello')]));

      const isBindingValid = useValidator(myBinding, () => wrappedValidator, {
        id: 'myBindingValidator'
      });

      expect(isBindingValid.value.get()?.isValid).toBeUndefined();
      expect(isBindingValid.isDisabled()).toBeFalsy();

      onMount(async () => {
        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(false));

        expect(wrappedValidator).toHaveBeenCalledTimes(1);
        expect(numResets).toBe(0);

        expect(isBindingValid.value.get()?.validationError).toBe(defaultValidationError);

        for (let index = 0; index < 10; index += 1) {
          myBinding.set(`hello${index}`);
          await sleep(0);
        }

        myBinding.set('world');

        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(true));

        expect(numResets).toBe(9);
        expect(wrappedValidator).toHaveBeenCalledTimes(11);

        expect(isBindingValid.value.get()?.validationError).toBeUndefined();

        myBinding.set('hello');

        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(false));

        expect(isBindingValid.value.get()?.validationError).toBe(defaultValidationError);
      });
    }));
});
