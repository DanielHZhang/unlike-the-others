import {EffectCallback, useEffect} from 'react';

/**
 * Mimicks partial behaviour of componentDidMount; only called once when component mounts.
 */
export function useDidMount(effect: EffectCallback): void {
  useEffect(effect, []);
}
