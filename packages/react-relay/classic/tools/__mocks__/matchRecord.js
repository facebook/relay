/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

type Result = {
  isMatched: boolean,
  message: ?string,
  path: ?Array<string>,
};

const METADATA_KEYS = {
  '__dataID__': true,
  '__range__': true,
  '__resolvedFragmentMap__': true,
  '__resolvedFragmentMapGeneration__': true,
  '__status__': true,
};

function toString(x) {
  if (!x) {
    return '' + x;
  } else {
    return JSON.stringify(x);
  }
}

function getType(a) {
  return Object.prototype.toString.call(a);
}

function match(
  actual: any,
  expected: any,
  path: Array<string>
): Result {
  if (
    typeof actual !== 'object' ||
    getType(actual) !== getType(expected)
  ) {
    return {
      isMatched: actual === expected,
      message: (
        'be ' +
        toString(expected) +
        ', but got ' +
        toString(actual)
      ),
      path,
    };
  }

  // All properties (except metadata keys) of `actual` should be in `expected`.
  for (const key in actual) {
    if (expected.hasOwnProperty(key) !== actual.hasOwnProperty(key) &&
        !(key in METADATA_KEYS)) {
      return {
        isMatched: false,
        message: 'not have key ' + key,
        path,
      };
    }
  }

  // All properties in `expected` should be in `actual`.
  for (const k in expected) {
    if (expected.hasOwnProperty(k) !== actual.hasOwnProperty(k)) {
      return {
        isMatched: false,
        message: 'have key ' + k,
        path,
      };
    }
    if (k in METADATA_KEYS) {
      continue;
    }
    const value = expected[k];
    if (Array.isArray(value)) {
      for (let jj = 0; jj < value.length; jj++) {
        path.push(k + '[' + jj + ']');
        const result = match(actual[k][jj], value[jj], path);
        if (!result.isMatched) {
          return result;
        } else {
          path.pop();
        }
      }
    } else {
      path.push(k);
      const result = match(actual[k], value, path);
      if (!result.isMatched) {
        return result;
      } else {
        path.pop();
      }
    }
  }
  return {
    isMatched: true,
    message: null,
    path: null,
  };
}

function matchRecord(actual: any, expected: any): Result {
  const {isMatched, path, message} = match(actual, expected, []);
  let location;
  if (path && path.length) {
    location = 'property at path `' + path.join('.') + '`';
  } else {
    location = 'value';
  }
  return {
    pass: isMatched,
    message: isMatched ?
      null :
      'Expected ' + location + ' to ' + message,
  };
}

module.exports = matchRecord;
