/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall relay
 */

'use strict';

const {hasCycle, stableCopy} = require('../stableCopy');

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
    const object: {a?: number, b?: number} = {};
    object.a = 1;
    object.b = 2;
    expect(stableCopy(object)).toEqual(object);
    expect(JSON.stringify(stableCopy(object))).toEqual('{"a":1,"b":2}');
  });

  it('copies stably, despite opposite key insertion order', () => {
    const object: {a?: number, b?: number} = {};
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

describe('hasCycle', () => {
  it('detects no cycles in primitives', () => {
    expect(hasCycle('foo')).toBe(false);
    expect(hasCycle('')).toBe(false);
    expect(hasCycle(null)).toBe(false);
    expect(hasCycle(undefined)).toBe(false);
    expect(hasCycle(10)).toBe(false);
    expect(hasCycle(Infinity)).toBe(false);
  });

  it('does not detect multiple null or NaN as a cycle', () => {
    expect(hasCycle([null, null])).toBe(false);
    expect(hasCycle([NaN, NaN])).toBe(false);
  });

  it('does not detect multiple empty objects or arrays as a cycle', () => {
    expect(hasCycle([{}, {}])).toBe(false);
    expect(hasCycle([[], []])).toBe(false);
  });

  it('detects an object that is a child of itself as a cycle', () => {
    const a: $FlowFixMe = {};
    a.self = a;
    expect(hasCycle(a)).toBe(true);
  });
  it('detects an object that is an indireect child of itself as a cycle', () => {
    const a: $FlowFixMe = {};
    a.indirectSelf = {aAgain: a};
    expect(hasCycle(a)).toBe(true);
  });
  it('detects an array that contains itself as a cycle', () => {
    const a: $FlowFixMe = [];
    a.push(a);
    expect(hasCycle(a)).toBe(true);
  });
  it('detects an object that contains itself indirectly as a cycle', () => {
    const a: $FlowFixMe = [];
    a.push({indirectSelf: a});
    expect(hasCycle(a)).toBe(true);
  });
  it('does not try to detect cycles in complex objects like Maps or Sets', () => {
    const a: $FlowFixMe = new Set();
    a.add(a);
    expect(hasCycle(a)).toBe(false);

    const b: $FlowFixMe = new Map();
    b.set(b, b);
    expect(hasCycle(b)).toBe(false);
  });
  it('does not try to detect function with itself as a property as a cycle (what are you even doing!?)', () => {
    const a: $FlowFixMe = function noop() {};
    a.self = a;
    expect(hasCycle(a)).toBe(false);
  });
});
