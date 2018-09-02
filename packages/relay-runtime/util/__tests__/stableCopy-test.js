/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @format
 */

'use strict';

const stableCopy = require('../stableCopy');

describe('stableCopy', () => {
  it('returns non-objects', () => {
    expect(stableCopy('foo')).toBe('foo');
    expect(stableCopy(1)).toBe(1);
    expect(stableCopy(-1)).toBe(-1);
    expect(stableCopy(true)).toBe(true);
    expect(stableCopy(false)).toBe(false);
    expect(stableCopy(null)).toBe(null);
    expect(stableCopy(undefined)).toBe(undefined);
  });

  it('copies empty objects', () => {
    expect(stableCopy({})).toEqual({});
  });

  it('copies empty arrays', () => {
    expect(stableCopy([])).toEqual([]);
  });

  it('copies shallow objects', () => {
    const object = {};
    object.a = 1;
    object.b = 2;
    expect(stableCopy(object)).toEqual(object);
    expect(JSON.stringify(stableCopy(object))).toEqual('{"a":1,"b":2}');
  });

  it('copies stably, despite opposite key insertion order', () => {
    const object = {};
    object.b = 2;
    object.a = 1;
    expect(stableCopy(object)).toEqual(object);
    expect(JSON.stringify(stableCopy(object))).toEqual('{"a":1,"b":2}');
  });

  it('copies shallow arrays', () => {
    const array = ['foo', 'bar', 'baz'];
    expect(stableCopy(array)).toEqual(array);
    expect(JSON.stringify(stableCopy(array))).toEqual('["foo","bar","baz"]');
  });

  it('copies sparse arrays', () => {
    const array = [];
    array[1] = 'foo';
    expect(stableCopy(array)).toEqual([undefined, 'foo']);
  });

  it('stable copies nested structures', () => {
    const object = {
      top2: {
        middle: {
          other: false,
          inner: [1, 'foo', ['bar', 2]],
        },
      },
      top1: [{first: true}, {first: false}, 'random'],
      misc: true,
      extra: null,
    };

    expect(stableCopy(object)).toEqual(object);

    expect(JSON.stringify(stableCopy(object))).toEqual(
      '{' +
        '"extra":null,' +
        '"misc":true,' +
        '"top1":[{"first":true},{"first":false},"random"],' +
        '"top2":{"middle":{"inner":[1,"foo",["bar",2]],"other":false}}' +
        '}',
    );
  });
});
