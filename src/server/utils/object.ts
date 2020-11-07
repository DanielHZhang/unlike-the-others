/**
 * Checks if the object is a plain object created with either `new Object()` or `{...}` and not
 * some subclass of Object.
 * @param value The unknown value to be checked.
 * @return True if the value is a plain object.
 */
export function isObject<K extends string | number | symbol, V = any>(
  value: any
): value is Record<K, V> {
  return value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype;
}

/**
 * Checks if a plain object is empty (has no keys nor values).
 * @param obj The plain object to be checked.
 * @return True if the plain object is empty.
 */
export function isObjectEmpty(obj: Record<any, unknown>): boolean {
  if (!isObject(obj)) {
    throw new Error(`Expected plain object but got: ${obj}`);
  }
  for (const prop in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, prop)) {
      return false;
    }
  }
  return true;
}
