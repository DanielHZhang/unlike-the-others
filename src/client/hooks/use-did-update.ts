import {DependencyList, EffectCallback, useLayoutEffect, useRef} from 'react';

/**
 * Mimicks full behaviour of componentDidUpdate; only called on subsequent renders.
 */
export function useDidUpdate(effect: EffectCallback, deps?: DependencyList): void {
  const firstUpdate = useRef(true);
  useLayoutEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false;
    } else {
      effect();
    }
  }, deps);
}
