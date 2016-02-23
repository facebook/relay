/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule stableStringify
 * @flow
 */

'use strict';

/**
 * Maintence a comletely support type list
 * For function expansions in the future
 */
function getStableType(value: any): string {
  if (value===null) { 
    return 'null';
  }
  const valueType = typeof value;
  switch (valueType) {
    case 'string':
    case 'number':
    case 'boolean':
    case 'symbol':
    case 'undefined':
      return valueType;
    case 'object':
      const subType = Object.prototype.toString.call(value);
      switch (subType) {
        case '[object Array]':
          if (value.length == Object.keys(value).length) {
            return 'array';
          }else {
            return 'object';
          }
        case '[object Object]':
        case '[object Arguments]':
          return 'object';
        case '[object Function]':
        case '[object RegExp]':
        default:
          return 'tojson';   
      }
    default:
      return 'unsupported';    
  }
}

/**
 * Return a customized ordered JSON serialization.
 * (does not handle corner cases such as circular references)
 * For compatible with old unit test code by other files. 
 * It remains to be a unstandardise JSON which cannt be parsed by JSON.parse
 * If need to be a standardise JSON, just `Double quotes` key, 
 * Change `${key}:${orderedJSON(input[key])}`
 * To     `"${key}":${orderedJSON(input[key])}`
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
 *      top1:[{first:true},{first:false},"random"],
 *      top2:{middle:{inner:[1,"foo",["bar",2]],other:false}}
 *    }
 */
function orderedJSON(input: any): string {
  switch (getStableType(input)) {
    case 'array':
      const array_fields = input
        .map(orderedJSON)
        .join(',');
      return `[${array_fields}]`;
      
    case 'object':
      const keys = Object.keys(input);
      keys.sort();
      const object_fields = keys
        .map(key => `${key}:${orderedJSON(input[key])}`)
        .join(',');
      return `{${object_fields}}`;
      
    case 'unsupported':
    case 'tojson':
    default :
      return JSON.stringify(input);
  }
}

/*
 * serialization javascript input to string
 * for string|number|boolean return plain String.
 * For complex object return orderedJSON-like string.
 * This switch is for consistence with Previously existing code
 * (ex: the root node argument)
 *
 * Suitable for use as a cache key or other similar internal
 * book-keeping detail.
 * 
 */
function stableStringify(input: mixed): string {
  switch (typeof input) {
    case 'string':
    case 'number':
    case 'boolean':
      return input.toString();
    default :
      return orderedJSON(input);
  }
}

module.exports = stableStringify;
