/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayContainerComparators
 * @flow
 * @typechecks
 */

'use strict';

/**
 * Compares `objectA` and `objectB` using the provided `isEqual` function.
 *
 * If a `filter` object is provided, only its keys will be checked during
 * comparison.
 */
function compareObjects(
  isEqual: (propA: any, propB: any, key: string) => boolean,
  objectA: Object,
  objectB: Object,
  filter?: Object
): boolean {
  var key;

  // Test for A's keys different from B.
  for (key in objectA) {
    if (filter && !filter.hasOwnProperty(key)) {
      continue;
    }

    if (objectA.hasOwnProperty(key) && (
          !objectB.hasOwnProperty(key) ||
          !isEqual(objectA[key], objectB[key], key))) {
      return false;
    }
  }
  // Test for B's keys missing from A.
  for (key in objectB) {
    if (filter && !filter.hasOwnProperty(key)) {
      continue;
    }

    if (objectB.hasOwnProperty(key) && !objectA.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
}

function isScalarAndEqual(valueA, valueB) {
  return valueA === valueB && (valueA === null || typeof valueA !== 'object');
}

function isQueryDataEqual(
  fragmentPointers: Object,
  currProp: mixed,
  nextProp: mixed,
  propName: string
): boolean {
  return (
    // resolved data did not change
    (fragmentPointers[propName] && currProp === nextProp) ||
    // otherwise compare fake data
    isScalarAndEqual(currProp, nextProp)
  );
}

function isNonQueryPropEqual(
  fragments: Object,
  currProp: mixed,
  nextProp: mixed,
  propName: string
): boolean {
  return (
    // ignore props with fragments (instead resolved values are compared)
    fragments.hasOwnProperty(propName) ||
    // otherwise props must be scalar and === in order to skip
    isScalarAndEqual(currProp, nextProp)
  );
}

/**
 * Relay-aware comparators for props and state provide a reasonable default
 * implementation of `shouldComponentUpdate`.
 */
const RelayContainerComparators = {
  areQueryResultsEqual(
    fragmentPointers: Object,
    prevQueryData: Object,
    nextQueryData: Object
  ): boolean {
    return compareObjects(
      isQueryDataEqual.bind(null, fragmentPointers),
      prevQueryData,
      nextQueryData
    );
  },

  areNonQueryPropsEqual(
    fragments: Object,
    props: Object,
    nextProps: Object
  ): boolean {
    return compareObjects(
      isNonQueryPropEqual.bind(null, fragments),
      props,
      nextProps
    );
  },

  areQueryVariablesEqual(
    variables: Object,
    nextVariables: Object
  ): boolean {
    return compareObjects(isScalarAndEqual, variables, nextVariables);
  },
};

module.exports = RelayContainerComparators;
