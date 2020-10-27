import {atom, useRecoilSnapshot, useRecoilState} from 'recoil';
import type {RecoilState, Loadable, LoadablePromise, Snapshot} from 'recoil';
import {useCallback} from 'react';

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

export function useAsyncAtomLoadable<T>(
  atom: RecoilState<T>
): [Loadable<T>, (arg: AsyncSetter<T>) => void] {
  const snapshot = useRecoilSnapshot();
  const [value, setValue] = useRecoilState(loadableAtomFamily(atom, snapshot));
  const set = useCallback(
    (setter: AsyncSetter<T>) => {
      (async () => {
        try {
          const promise: LoadablePromise<T> = new Promise((resolve, reject) => {
            (typeof setter === 'function' ? setter() : setter)
              .then((result) => {
                resolve({value: result});
              })
              .catch((reason) => reject(reason));
            // .catch((reason) => reject(reason));
          });
          setValue({state: 'loading', contents: promise});

          setValue({state: 'hasValue', contents: (await promise).value});
        } catch (error) {
          console.log('goes here with error:', error);
          setValue({state: 'hasError', contents: error});
        }
      })(); // wrapping this so the return type is void, not Promise<void>
    },
    [setValue]
  );
  return [value, set];
}

export function useAsyncAtom<T>(atom: RecoilState<T>): [T, (arg: AsyncSetter<T>) => void] {
  const [value, setValue] = useAsyncAtomLoadable(atom);
  if (value.state === 'hasValue') {
    return [value.contents, setValue];
  }
  return value;
  throw value.contents;
}

export function useSetAsyncAtom<T>(atom: RecoilState<T>): (arg: AsyncSetter<T>) => void {
  const [, setValue] = useAsyncAtomLoadable(atom);
  return setValue;
}

export function useAsyncAtomValue<T>(atom: RecoilState<T>): T {
  const [value] = useAsyncAtomLoadable(atom);
  if (value.state === 'hasValue') {
    return value.contents;
  }
  return value;
  // throw value.contents;
}
