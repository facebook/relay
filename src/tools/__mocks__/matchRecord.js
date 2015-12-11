/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

const GraphQLFragmentPointer = require('GraphQLFragmentPointer');

type Result = {
  isMatched: boolean;
  message: ?string;
  path: ?Array<string>;
};

var METADATA_KEYS = {
  '__dataID__': true,
  '__range__': true,
  '__resolvedFragmentMap__': true,
  '__resolvedFragmentMapGeneration__': true,
  '__status__': true,
};

function matchRecord(
  actual: any,
  expected: any,
  path: Array<string>
): Result {
  if (typeof actual !== 'object') {
    return {
      isMatched: actual === expected,
      message: 'be ' + expected + ', but got ' + actual,
      path
    };
  }

  if (actual instanceof GraphQLFragmentPointer) {
    if (expected instanceof GraphQLFragmentPointer) {
      return {
        isMatched: actual.equals(expected),
        message: (
          'be ' + expected.toString() + ', but got ' + actual.toString()
        ),
        path
      };
    } else {
      return {
        isMatched: false,
        message: 'be ' + expected + ', but got ' + actual.toString(),
        path
      };
    }
  } else if (expected instanceof GraphQLFragmentPointer) {
    return {
      isMatched: false,
      message: 'be ' + expected.toString() + ', but got ' + actual,
      path
    };
  }

  // all properties (lest __dataID__s) of `actual` should be in `expected`
  for (var key in actual) {
    if (expected.hasOwnProperty(key) !== actual.hasOwnProperty(key) &&
        !(key in METADATA_KEYS)) {
      return {
        isMatched: false,
        message: 'not have key ' + key,
        path
      };
    }
  }
  // all properties in `expected` should be in `actual`
  var result;
  for (var k in expected) {
    if (expected.hasOwnProperty(k) !== actual.hasOwnProperty(k)) {
      return {
        isMatched: false,
        message: 'have key ' + k,
        path
      };
    }
    if (k in METADATA_KEYS) {
      continue;
    }
    var value = expected[k];
    if (Array.isArray(value)) {
      for (var jj = 0; jj < value.length; jj++) {
        path.push(k + '[' + jj + ']');
        result = matchRecord(actual[k][jj], value[jj], path);
        if (!result.isMatched) {
          return result;
        } else {
          path.pop();
        }
      }
    } else {
      path.push(k);
      result = matchRecord(actual[k], value, path);
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
    path: null
  };
}

module.exports = matchRecord;
