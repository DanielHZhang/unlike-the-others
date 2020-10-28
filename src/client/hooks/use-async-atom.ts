import {atom, useRecoilSnapshot, useRecoilState} from 'recoil';
import type {RecoilState, Loadable, LoadablePromise, Snapshot} from 'recoil';
import {useCallback} from 'react';
import {isAxiosError} from 'src/client/network';

type Setable<T> = (fn: AsyncSetter<T>) => Promise<void>;
type AsyncSetter<T> = Promise<T> | (<TArgs extends any[]>(...args: TArgs) => Promise<T>);

function memoize<R, T>(func: (state: RecoilState<T>, snapshot: Snapshot) => R) {
  const cache: Map<RecoilState<T>, R> = new Map();
  return function memoized(state: RecoilState<T>, snapshot: Snapshot) {
    if (!cache.has(state)) {
      cache.set(state, func(state, snapshot));
    }
    return cache.get(state)!;
  };
}

const loadableAtomFamily = memoize(<T>(state: RecoilState<T>, snapshot: Snapshot) =>
  atom<Loadable<T>>({
    key: `loadable_${state.key}`,
    default: snapshot.getLoadable(state),
  })
);

/**
 * Returns the contents of the resolved atom and a setter function to change
 * the value of the atom.
 */
export function useAsyncAtomLoadable<T>(
  atom: RecoilState<T>
): [Loadable<T>, Setable<T>] {
  const snapshot = useRecoilSnapshot();
  const [value, setValue] = useRecoilState(loadableAtomFamily(atom, snapshot));
  const set = useCallback(
    async (setter: AsyncSetter<T>) => {
      try {
        const promise: LoadablePromise<T> = new Promise((resolve, reject) => {
          (typeof setter === 'function' ? setter() : setter)
            .then((result) => {
              resolve({value: result}); // Resolve the outer promise with the result
            })
            .catch(reject); // Reject the outer promise with the reason
        });
        setValue({state: 'loading', contents: promise});
        const resolved = await promise; // Await the promise
        setValue({state: 'hasValue', contents: resolved.value});
      } catch (error) {
        // If the error is an axios network error, get the inner data object
        setValue({
          state: 'hasError',
          contents: isAxiosError(error) ? error.response.data : error,
        });
      }
      // (async () => {
      //   try {
      //     const promise: LoadablePromise<T> = new Promise((resolve, reject) => {
      //       (typeof setter === 'function' ? setter() : setter)
      //         .then((result) => {
      //           resolve({value: result}); // Resolve the outer promise with the result
      //         })
      //         .catch(reject); // Reject the outer promise with the reason
      //     });
      //     setValue({state: 'loading', contents: promise});
      //     const resolved = await promise; // Await the promise
      //     setValue({state: 'hasValue', contents: resolved.value});
      //   } catch (error) {
      //     // If the error is an axios network error, get the inner data object
      //     setValue({
      //       state: 'hasError',
      //       contents: isAxiosError(error) ? error.response.data : error,
      //     });
      //   }
      // })(); // wrap to ensure the return type is void, not Promise<void>
    },
    [setValue]
  );
  return [value, set];
}

/**
 * Returns a setter function to change the value of the async atom.
 */
export function useSetAsyncAtom<T>(atom: RecoilState<T>): Setable<T> {
  const [, setValue] = useAsyncAtomLoadable(atom);
  return setValue;
}

/**
 * Returns the contents of the resolved atom, or undefined if in 'hasError'
 * or 'loading' states.
 */
export function useAsyncAtomValue<T>(atom: RecoilState<T>): T | undefined {
  const [value] = useAsyncAtomLoadable(atom);
  if (value.state === 'hasValue') {
    return value.contents;
  }
  return undefined;
}
