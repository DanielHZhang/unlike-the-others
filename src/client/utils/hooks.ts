import {useEffect, EffectCallback, useRef, DependencyList, useLayoutEffect} from 'react';

/**
 * Mimicks partial behaviour of componentDidMount; only called once when component mounts.
 */
export function useDidMount(effect: EffectCallback) {
  useEffect(effect, []);
}

/**
 * Allows passing an async function directly into the useEffect hook.
 */
export function useAsyncEffect(asyncEffect: () => Promise<any>, deps?: DependencyList) {
  useEffect(() => {
    asyncEffect();
  }, deps);
}

/**
 * Mimicks full behaviour of componentDidUpdate; only called on subsequent renders.
 */
export function useDidUpdate(effect: EffectCallback, deps?: DependencyList) {
  const firstUpdate = useRef(true);
  useLayoutEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false;
    } else {
      effect();
    }
  }, deps);
}
