import {useEffect, DependencyList} from 'react';

/**
 * Allows passing an async function directly into the useEffect hook.
 */
export function useAsyncEffect(asyncEffect: () => Promise<any>, deps?: DependencyList) {
  useEffect(() => {
    asyncEffect();
  }, deps);
}
