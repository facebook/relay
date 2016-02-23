/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+relay
 */

'use strict';

const stableStringify = require('stableStringify');

describe('stableStringify', () => {
  it('stringifies non-objects', () => {
    expect(stableStringify('foo')).toBe('foo');
    expect(stableStringify(1)).toBe('1');
    expect(stableStringify(-1)).toBe('-1');
    expect(stableStringify(true)).toBe('true');
    expect(stableStringify(false)).toBe('false');
    expect(stableStringify(null)).toBe('null');
    expect(stableStringify()).toBe(undefined);
  });

  it('stringifies empty objects', () => {
    expect(stableStringify({})).toBe('{}');
  });

  it('stringifies empty arrays', () => {
    expect(stableStringify([])).toBe('[]');
  });

  it('stringifies shallow objects', () => {
    var object = {};
    object.a = 1;
    object.b = 2;
    expect(stableStringify(object)).toBe('{a:1,b:2}');
  });

  it('stringifies stably, despite opposite key insertion order', () => {
    var object = {};
    object.b = 2;
    object.a = 1;
    expect(stableStringify(object)).toBe('{a:1,b:2}');
  });

  it('stringifies shallow arrays', () => {
    var array = ['foo', 'bar', 'baz'];
    expect(stableStringify(array)).toBe('["foo","bar","baz"]');
  });

  describe('Consistent with Javascript-related special array behavior', () => {
    // Todo Consider if should treat undefined as same as a holes?
    it('treat "holes-array" as an object', () => {      
      var array =[];
      array[1] = undefined;
      array[999] = 'foo';
      expect(stableStringify(
        array
      )).toBe('{1:undefined,999:"foo"}');
      
      // Though `[ , , ]` is not allow by fb'eslint
      // It may be passed in by outside code.
      expect(stableStringify(
        [ , , , 'foo']
      )).toBe('{3:"foo"}');
      
      expect(stableStringify(
        [null, undefined, null, 'foo']
      )).toBe('[null,,null,"foo"]');
      
      expect(stableStringify(
        [null, , null, 'foo']
      )).toBe('{0:null,2:null,3:"foo"}');

    });
    
    // Javascript function arguments is an `[object Arguments]`
    // Just be treated as an object
    it('consistent with Javascript function arguments', () => {
      function jsArgs(a, b, c) {
        return arguments;
      }
      
      expect(stableStringify(
        jsArgs(null,undefined,null,'foo')
        ))
      .toBe('{0:null,1:undefined,2:null,3:"foo"}');
      
      var array =[ , 'bar', , 'foo'];
      expect(stableStringify(jsArgs(...array)))
      .toBe('{0:undefined,1:"bar",2:undefined,3:"foo"}');
      
      array =[];
      array[3] = 'foo';
      expect(stableStringify(jsArgs(...array)))
      .toBe('{0:undefined,1:undefined,2:undefined,3:"foo"}');
      
    });
    
  });
    

  it('stringifies nested structures', () => {
    var object = {
      top2: {
        middle: {
          inner: [1, 'foo', ['bar', 2]],
          other: false,
        },
      },
      top1: [
        {first: true},
        {first: false},
        'random',
      ],
      misc: true,
      extra: null,
    };

    var expected =
      '{' +
      'extra:null,' +
      'misc:true,' +
      'top1:[{first:true},{first:false},"random"],' +
      'top2:{middle:{inner:[1,"foo",["bar",2]],other:false}}' +
      '}';
      
    expect(stableStringify(object)).toBe(expected);
  });
});
