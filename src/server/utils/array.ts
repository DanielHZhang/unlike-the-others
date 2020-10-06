export function findSmallestMissingInt(array: number[]) {
  const temp = Array.from<boolean>({length: array.length}).fill(false);
  for (let i = 0; i < array.length; i++) {
    if (array[i] > 0 && array[i] <= array.length) {
      temp[array[i]] = true;
    }
  }
  for (let i = 1; i <= array.length; i++) {
    if (!temp[i]) {
      return i;
    }
  }
  return array.length + 1;
}
