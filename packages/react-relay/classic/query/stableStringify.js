/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

function isObject(value: mixed) {
  return (
    value !== null &&
    Object.prototype.toString.call(value) === '[object Object]'
  );
}

/**
 * Simple recursive stringifier that handles basic objects (does not handle
 * corner cases such as circular references) and produces a JSON-like
 * serialization suitable for use as a cache key or other similar internal
 * book-keeping detail.
 *
 * Sample input:
 *
 *     var object = {
 *       top2: {
 *         middle: {
 *           inner: [1, 'foo', ['bar', 2]],
 *           other: false,
 *         },
 *       },
 *       top1: [
 *         {first: true},
 *         {first: false},
 *         'random',
 *       ],
 *       misc: true,
 *       extra: null,
 *     };
 *
 * Sample output (some whitespace added for clarity):
 *
 *    {
 *      extra:null,
 *      misc:true,
 *      top1:[0:{first:true},1:{first:false},2:"random"],
 *      top2:{middle:{inner:[0:1,1:"foo",2:[0:"bar",1:2]],other:false}}
 *    }
 */
function stableStringify(input: any): string {
  const inputIsArray = Array.isArray(input);
  const inputIsObject = isObject(input);
  if (inputIsArray || inputIsObject) {
    const keys = Object.keys(input);
    if (keys.length) {
      const result = [];
      keys.sort();

      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        let value = input[key];
        if (isObject(value) || Array.isArray(value)) {
          value = stableStringify(value);
        } else {
          value = JSON.stringify(value);
        }
        result.push(key + ':' + value);
      }

      if (inputIsArray) {
        return '[' + result.join(',') + ']';
      } else {
        return '{' + result.join(',') + '}';
      }
    }
  }
  return JSON.stringify(input);
}

module.exports = stableStringify;
