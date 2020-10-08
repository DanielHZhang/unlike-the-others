/**
 * Checks if the object is a plain object created with either `new Object()` or `{...}` and not
 * some subclass of Object.
 * @param value The unknown value to be checked.
 * @return True if the value is a plain object.
 */
export function isRecord<K extends string | number | symbol, V = any>(
  value: any
): value is Record<K, V> {
  return value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype;
}
