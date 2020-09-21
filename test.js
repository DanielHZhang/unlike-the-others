// const array = [41, 32, 1, 2, 3, 123, 15];
const array = [1, 1, 1, 1, 1, 1, 2];

function findMissingPositive(array) {
  for (let i = 0; i < array.length; i++) {
    const cur = Math.abs(array[i]);
    if (cur - 1 < array.length && array[cur - 1] > 0) {
      array[cur - 1] = -array[cur - 1];
    }
  }
  for (let i = 0; i < array.length; i++) {
    if (array[i] > 0) {
      return i + 1;
    }
  }
  return array.length + 1;
}

/**
 * @param array {number[]}
 */
function same(array) {
  const temp = new Array(array.length).fill(false);
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

console.log(same(array));
