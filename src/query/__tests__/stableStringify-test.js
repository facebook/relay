/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+relay
 */

'use strict';

var stableStringify = require('stableStringify');

describe('stableStringify', () => {
  it('stringifies non-objects', () => {
    expect(stableStringify('foo')).toBe('"foo"');
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
    expect(stableStringify(array)).toBe('[0:"foo",1:"bar",2:"baz"]');
  });

  it('skips "holes" in sparse arrays', () => {
    var array = [];
    array[5] = 'foo';
    expect(stableStringify(array)).toBe('[5:"foo"]');
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
      'top1:[0:{first:true},1:{first:false},2:"random"],' +
      'top2:{middle:{inner:[0:1,1:"foo",2:[0:"bar",1:2]],other:false}}' +
      '}';

    expect(stableStringify(object)).toBe(expected);
  });
});
