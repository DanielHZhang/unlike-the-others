import type {AnyFunction} from 'src/shared/types';

interface Debounced<F extends AnyFunction> {
  (...args: Parameters<F>): ReturnType<F>;
  cancel: () => void;
  isActive: () => boolean;
  now: (...args: Parameters<F>) => ReturnType<F>;
}

/**
 * Invokes given function `wait` milliseconds after this function was last called.
 * Can be cancelled via `.cancel()`, called immediately via `.now()`, or checked
 * if active via `.isActive()`.
 */
export function debounce<F extends AnyFunction>(fn: F, wait: number): Debounced<F> {
  let timer: number | undefined = undefined;

  function debounced(...args: Parameters<F>) {
    clearTimeout(timer);
    timer = window.setTimeout(() => {
      fn(...args);
      timer = undefined;
    }, wait);
  }
  debounced.prototype.cancel = (): void => {
    clearTimeout(timer);
    timer = undefined;
  };
  debounced.prototype.now = (...args: Parameters<F>): ReturnType<F> => {
    clearTimeout(timer);
    timer = undefined;
    return fn(...args);
  };
  debounced.prototype.isActive = (): boolean => {
    return timer ? !isNaN(timer) : false;
  };

  return debounced as Debounced<F>;
}
