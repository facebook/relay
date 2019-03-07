/* @flow */

/**
 * Partitions an array given a predicate. All elements satisfying the predicate
 * are part of the first returned array, and all elements that don't are in the
 * second.
 */
function partitionArray<Tv>(
  array: $ReadOnlyArray<Tv>,
  predicate: (value: Tv) => boolean,
): [Array<Tv>, Array<Tv>] {
  const first = [];
  const second = [];
  for (let i = 0; i < array.length; i++) {
    const item = array[i];
    if (predicate(item)) {
      first.push(item);
    } else {
      second.push(item);
    }
  }
  return [first, second];
}

module.exports = partitionArray;
