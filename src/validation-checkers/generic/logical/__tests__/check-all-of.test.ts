import { jest } from '@jest/globals';
import { waitFor } from '@testing-library/react';
import { useBinding } from 'react-bindings';

import { runInDom } from '../../../../__test_dependency__/run-in-dom.js';
import { sleep } from '../../../../__test_dependency__/sleep.js';
import { validState } from '../../../../consts/basic-validation-results.js';
import { defaultValidationError } from '../../../../consts/default-validation-error.js';
import { USE_FIRST_ERROR, USE_LAST_ERROR } from '../../../../consts/logical-validation-checkers.js';
import { useValidator } from '../../../../use-validator/use-validator.js';
import type { ValidationChecker, ValidationCheckerFunction } from '../../../../validator/types/validation-checker';
import type { ValidationResult } from '../../../../validator/types/validation-result';
import { resolveValidationError } from '../../../../validator/utils/resolve-validation-error.js';
import { checkStringNotEmpty } from '../../../string/string-length.js';
import { checkEquals, checkNotEquals } from '../../equals.js';
import { checkAllOf, checkValidity } from '../check-all-of.js';

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
      const wrapValidator = (checker: ValidationChecker<string>) =>
        jest.fn<ValidationCheckerFunction<string>>(async (value, args) => {
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

  it('should work with validationError="use-first-error"', () =>
    runInDom(({ onMount }) => {
      const myBinding = useBinding(() => '', { id: 'myBinding' });
      const isBindingValid = useValidator(
        myBinding,
        () => checkAllOf([checkStringNotEmpty('must not be empty'), checkNotEquals('hello', 'must not be hello')], USE_FIRST_ERROR),
        { id: 'myBindingValidator' }
      );

      expect(isBindingValid.value.get()?.isValid).toBeUndefined();
      expect(isBindingValid.isDisabled()).toBeFalsy();

      onMount(async () => {
        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(false));

        expect(isBindingValid.value.get()?.validationError).toBe('must not be empty');

        myBinding.set('world');

        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(true));

        expect(isBindingValid.value.get()?.validationError).toBeUndefined();

        myBinding.set('hello');

        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(false));

        expect(isBindingValid.value.get()?.validationError).toBe('must not be hello');
      });
    }));

  it('should work with validationError="use-last-error"', () =>
    runInDom(({ onMount }) => {
      const myBinding = useBinding(() => '', { id: 'myBinding' });
      const isBindingValid = useValidator(
        myBinding,
        () => checkAllOf([checkStringNotEmpty('must not be empty'), checkNotEquals('hello', 'must not be hello')], USE_LAST_ERROR),
        { id: 'myBindingValidator' }
      );

      expect(isBindingValid.value.get()?.isValid).toBeUndefined();
      expect(isBindingValid.isDisabled()).toBeFalsy();

      onMount(async () => {
        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(false));

        expect(isBindingValid.value.get()?.validationError).toBe('must not be empty');

        myBinding.set('world');

        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(true));

        expect(isBindingValid.value.get()?.validationError).toBeUndefined();

        myBinding.set('hello');

        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(false));

        expect(isBindingValid.value.get()?.validationError).toBe('must not be hello');
      });
    }));

  it('should work with deferred validationError', () =>
    runInDom(({ onMount }) => {
      const myBinding = useBinding(() => '', { id: 'myBinding' });
      const isBindingValid = useValidator(
        myBinding,
        () =>
          checkAllOf(
            [checkStringNotEmpty('must not be empty'), checkEquals(['hello', 'goodbye'], 'must be hello or goodbye')],
            (t, results) =>
              (results.filter((result) => result !== undefined && !result.isValid) as Array<ValidationResult & { isValid: false }>)
                .map((result) => resolveValidationError(result.validationError, t))
                .join(' AND ')
          ),
        { id: 'myBindingValidator' }
      );

      expect(isBindingValid.value.get()?.isValid).toBeUndefined();
      expect(isBindingValid.isDisabled()).toBeFalsy();

      onMount(async () => {
        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(false));

        expect(resolveValidationError(isBindingValid.value.get()?.validationError)).toBe('must not be empty AND must be hello or goodbye');

        myBinding.set('world');

        await waitFor(() => expect(resolveValidationError(isBindingValid.value.get()?.validationError)).toBe('must be hello or goodbye'));

        myBinding.set('hello');

        await waitFor(() => expect(isBindingValid.value.get()?.isValid).toBe(true));

        expect(isBindingValid.value.get()?.validationError).toBeUndefined();
      });
    }));
});
