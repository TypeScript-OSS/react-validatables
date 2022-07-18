import { runAfterInteractions } from 'client-run-queue';
import type { TypeOrPromisedType } from 'react-waitables';

/**
 * Runs a collection of potentially-async functions after interactions have been allowed, using `runAfterInteractions` from
 * `client-run-queue`, which is configurable (e.g. for React vs React Native).
 *
 * Each function is passed `stop` and `wasStopped` functions that can be called to stop execution of all functions and to check if stop was
 * requested, respectively.
 */
export const runAllAfterInteractions = <T>(
  id: string,
  funcs: Array<(args: { stop: () => void; wasStopped: () => boolean }) => TypeOrPromisedType<T | undefined>>
): Promise<Array<T | undefined>> => {
  const promises: Array<Promise<T | undefined>> = [];
  const cancelers: Array<() => void> = [];

  let shouldStop = false;
  const stop = () => {
    if (shouldStop) {
      return;
    }

    shouldStop = true;
    for (const cancel of cancelers) {
      cancel();
    }
  };

  const wasStopped = () => shouldStop;

  for (const func of funcs) {
    promises.push(
      new Promise((resolve, reject) => {
        let didResolve = false;
        const cancel = runAfterInteractions(id, async () => {
          if (shouldStop) {
            if (didResolve) {
              return;
            }
            didResolve = true;

            return resolve(undefined);
          }

          try {
            if (didResolve) {
              return;
            }
            didResolve = true;

            resolve(await func({ stop, wasStopped }));
          } catch (e) {
            if (didResolve) {
              return;
            }
            didResolve = true;

            reject(e);
          }
        });

        cancelers.push(() => {
          cancel();

          if (didResolve) {
            return;
          }
          didResolve = true;

          resolve(undefined);
        });
      })
    );
  }

  return Promise.all(promises);
};
