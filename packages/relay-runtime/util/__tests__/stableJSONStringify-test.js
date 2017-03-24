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

jest.disableAutomock();

const stableJSONStringify = require('stableJSONStringify');

describe('stableJSONStringify', () => {
  it('stringifies non-objects', () => {
    expect(stableJSONStringify('foo')).toBe('"foo"');
    expect(stableJSONStringify(1)).toBe('1');
    expect(stableJSONStringify(-1)).toBe('-1');
    expect(stableJSONStringify(true)).toBe('true');
    expect(stableJSONStringify(false)).toBe('false');
    expect(stableJSONStringify(null)).toBe('null');
    expect(stableJSONStringify()).toBe(undefined);
  });

  it('stringifies empty objects', () => {
    expect(stableJSONStringify({})).toBe('{}');
  });

  it('stringifies empty arrays', () => {
    expect(stableJSONStringify([])).toBe('[]');
  });

  it('stringifies shallow objects', () => {
    const object = {};
    object.a = 1;
    object.b = 2;
    expect(stableJSONStringify(object)).toBe('{"a":1,"b":2}');
  });

  it('stringifies stably, despite opposite key insertion order', () => {
    const object = {};
    object.b = 2;
    object.a = 1;
    expect(stableJSONStringify(object)).toBe('{"a":1,"b":2}');
  });

  it('stringifies shallow arrays', () => {
    const array = ['foo', 'bar', 'baz'];
    expect(stableJSONStringify(array)).toBe('["foo","bar","baz"]');
  });

  it('adds nulls in sparse arrays', () => {
    const array = [];
    array[1] = 'foo';
    expect(stableJSONStringify(array)).toBe('[null,"foo"]');
  });

  it('stringifies nested structures', () => {
    const object = {
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

    const expected =
      '{' +
      '"extra":null,' +
      '"misc":true,' +
      '"top1":[{"first":true},{"first":false},"random"],' +
      '"top2":{"middle":{"inner":[1,"foo",["bar",2]],"other":false}}' +
      '}';

    expect(stableJSONStringify(object)).toBe(expected);
  });
});
