import { waitFor } from '@testing-library/react';
import { useBinding } from 'react-bindings';

import { runInDom, sleep } from '../../__test_dependency__';
import { useValidator } from '../../use-validator/use-validator';
import { checkStringNotEmpty } from '../../validators/exports';
import { finalizeValidation } from '../finalize-validation';

describe('finalizeValidation', () => {
  it('should work', () =>
    runInDom(({ onMount }) => {
      const a = useBinding(() => '', { id: 'test1' });
      const aValidator = useValidator(a, () => checkStringNotEmpty(), { id: 'aValidator', disabledWhileUnmodified: a });

      const b = useBinding(() => '', { id: 'test2' });
      const bValidator = useValidator(
        b,
        async () => {
          await sleep(500);

          return checkStringNotEmpty();
        },
        { id: 'bValidator', disabledWhileUnmodified: b }
      );

      const formValidator = useValidator([aValidator, bValidator], (validators) => validators, { id: 'formValidator' });

      onMount(async () => {
        await waitFor(() => expect(formValidator.value.get()?.isValid).toBe(true));

        expect(aValidator.value.get()?.isDisabled).toBe(true);
        expect(bValidator.value.get()?.isDisabled).toBe(true);
        expect(formValidator.value.get()?.isDisabled).toBe(false);

        const result1 = await new Promise((resolve) => {
          finalizeValidation(formValidator, {
            bindings: { a, b },
            onValid: ({ a, b }) => {
              resolve(`valid:${a}:${b}`);
            },
            onInvalid: ({ a, b }) => {
              resolve(`invalid:${a}:${b}`);
            }
          });
        });

        expect(result1).toBe('invalid::');

        a.set('hello');
        b.set('world');

        for (let index = 0; index < 10; index += 1) {
          setTimeout(() => {
            a.set(`hello${index}`);
          }, index * 10 + 10);
        }

        const result2 = await new Promise((resolve) => {
          finalizeValidation(formValidator, {
            bindings: { a, b },
            onValid: ({ a, b }) => {
              resolve(`valid:${a}:${b}`);
            },
            onInvalid: ({ a, b }) => {
              resolve(`invalid:${a}:${b}`);
            }
          });
        });

        expect(result2).toBe('valid:hello:world');

        expect(a.get()).toBe('hello9');
      });
    }));
});
