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

require('configureForRelayOSS');

jest.dontMock('recycleNodesInto');

const GraphQLFragmentPointer = require('GraphQLFragmentPointer');
const Relay = require('Relay');
const RelayTestUtils = require('RelayTestUtils');

const recycleNodesInto = require('recycleNodesInto');

describe('recycleNodesInto', () => {
  beforeEach(() => {
    jest.resetModuleRegistry();
  });

  describe('scalars', () => {
    it('ignores when `prevData` is null or undefined', () => {
      var nextData = {};
      expect(recycleNodesInto(null, nextData)).toBe(nextData);
      expect(recycleNodesInto(undefined, nextData)).toBe(nextData);
    });

    it('returns when `nextData` is null or undefined', () => {
      var prevData = {};
      expect(recycleNodesInto(prevData, null)).toBe(null);
      expect(recycleNodesInto(prevData, undefined)).toBe(undefined);
    });

    it('returns when `nextData` is a string or number', () => {
      expect(recycleNodesInto(null, 'foo')).toBe('foo');
      expect(recycleNodesInto(null, 1)).toBe(1);
    });

    it('ignores when `prevData` is not exactly the same', () => {
      expect(recycleNodesInto(1, '1')).toBe('1');
      expect(recycleNodesInto(null, '')).toBe('');
    });
  });

  describe('objects', () => {
    it('recycles equal leaf objects', () => {
      var prevData = {foo: 1};
      var nextData = {foo: 1};
      expect(recycleNodesInto(prevData, nextData)).toBe(prevData);
    });

    it('recycles parent objects with equal leaf objects', () => {
      var prevData = {foo: {bar: 1}};
      var nextData = {foo: {bar: 1}};
      expect(recycleNodesInto(prevData, nextData)).toBe(prevData);
    });

    it('does not recycle unequal leaf objects', () => {
      var prevData = {foo: 1};
      var nextData = {foo: 100};
      expect(recycleNodesInto(prevData, nextData)).not.toBe(prevData);
    });

    it('does not recycle parent objects with unequal leaf objects', () => {
      var prevData = {foo: {bar: 1}};
      var nextData = {foo: {bar: 100}};
      expect(recycleNodesInto(prevData, nextData)).not.toBe(prevData);
    });

    it('does not recycle object with fewer properties', () => {
      var prevData = {foo: 1};
      var nextData = {foo: 1, bar: 2};
      expect(recycleNodesInto(prevData, nextData)).not.toBe(prevData);
    });

    it('does not recycle object with more properties', () => {
      var prevData = {foo: 1, bar: 2};
      var nextData = {foo: 1};
      expect(recycleNodesInto(prevData, nextData)).toEqual({foo: 1});
    });

    it('recycles equal leaf objects with unequal parent objects', () => {
      var prevData = {foo: {bar: 1}, baz: 2};
      var nextData = {foo: {bar: 1}, baz: 200};
      var recycled = recycleNodesInto(prevData, nextData);

      expect(recycled).not.toBe(prevData);
      expect(recycled.bar).toBe(prevData.bar);
    });

    it('does not recycle arrays as objects', () => {
      var prevData = [1, 2];
      var nextData = {0: 1, 1: 2};
      expect(recycleNodesInto(prevData, nextData)).not.toBe(prevData);
    });
  });

  describe('arrays', () => {
    it('recycles arrays with equal scalars', () => {
      var prevData = [1, 2, 3];
      var nextData = [1, 2, 3];
      expect(recycleNodesInto(prevData, nextData)).toBe(prevData);
    });

    it('does not recycle arrays with unequal scalars', () => {
      var prevData = [1, 2, 3];
      var nextData = [4, 5, 6];
      expect(recycleNodesInto(prevData, nextData)).not.toBe(prevData);
    });

    it('recycles arrays with equal objects without mutating `prevData`', () => {
      var prevData = [{foo: 1}, {bar: 2}];
      var nextData = [{foo: 1}, {bar: 2}];
      expect(recycleNodesInto(prevData, nextData)).toBe(prevData);
    });

    it('recycles arrays without mutating `prevData`', () => {
      var prevItem = {foo: 1};
      var prevData = [prevItem];
      var nextData = [{foo: 1}];
      var recycled = recycleNodesInto(prevData, nextData);

      expect(recycled).toBe(prevData);
      expect(recycled[0]).toBe(prevItem);
    });

    it('recycles arrays with equal objects but unequal parent objects', () => {
      var prevData = {foo: [{foo: 1}, {bar: 2}], qux: 3};
      var nextData = {foo: [{foo: 1}, {bar: 2}], qux: 300};
      var recycled = recycleNodesInto(prevData, nextData);

      expect(recycled).not.toBe(prevData);
      expect(recycled.foo).toBe(prevData.foo);
    });

    it('recycles equal objects from an array with unequal siblings', () => {
      var prevData = [{foo: 1}, {bar: 2}];
      var nextData = [{foo: 1}, {bar: 200}];
      var recycled = recycleNodesInto(prevData, nextData);

      expect(recycled).not.toBe(prevData);
      expect(recycled[0]).toBe(prevData[0]);
      expect(recycled[1]).not.toBe(prevData[1]);
    });

    it('recycles equal objects from an array with fewer siblings', () => {
      var prevData = [{foo: 1}];
      var nextData = [{foo: 1}, {bar: 2}];
      var recycled = recycleNodesInto(prevData, nextData);

      expect(recycled).not.toBe(prevData);
      expect(recycled[0]).toBe(prevData[0]);
      expect(recycled[1]).toEqual({bar: 2});
    });

    it('recycles equal objects from an array with more siblings', () => {
      var prevData = [{foo: 1}, {bar: 2}];
      var nextData = [{foo: 1}];
      var recycled = recycleNodesInto(prevData, nextData);

      expect(recycled).not.toBe(prevData);
      expect(recycled[0]).toBe(prevData[0]);
      expect(recycled.length).toBe(1);
    });

    it('does not recycle objects as arrays', () => {
      var prevData = Object.assign(Object.create({length: 2}), {0: 1, 1: 2});
      var nextData = [1, 2];
      expect(recycleNodesInto(prevData, nextData)).not.toBe(prevData);
    });
  });

  describe('fragment pointers', () => {
    var getPointer;

    beforeEach(() => {
      var {getNode} = RelayTestUtils;

      var fragment = getNode(Relay.QL`fragment on Node{id}`);
      getPointer = function(dataID) {
        return new GraphQLFragmentPointer(dataID, fragment);
      };
    });

    it('recycles equal fragment pointers', () => {
      var prevData = getPointer('A');
      var nextData = getPointer('A');
      expect(recycleNodesInto(prevData, nextData)).toBe(prevData);
    });

    it('recycles parent objects with equal fragment pointers', () => {
      var prevData = {foo: getPointer('A')};
      var nextData = {foo: getPointer('A')};
      expect(recycleNodesInto(prevData, nextData)).toBe(prevData);
    });

    it('recycles arrays with equal fragment pointers', () => {
      var prevData = [getPointer('A')];
      var nextData = [getPointer('A')];
      expect(recycleNodesInto(prevData, nextData)).toBe(prevData);
    });

    it('does not recycle unequal fragment pointers', () => {
      var prevData = getPointer('A');
      var nextData = getPointer('B');
      expect(recycleNodesInto(prevData, nextData)).toBe(nextData);
    });

    it('does not recycle parent objects with unequal fragment pointers', () => {
      var prevData = {foo: getPointer('A')};
      var nextData = {foo: getPointer('B')};
      expect(recycleNodesInto(prevData, nextData)).toBe(nextData);
    });

    it('does not recycle arrays with unequal fragment pointers', () => {
      var prevData = [getPointer('A')];
      var nextData = [getPointer('B')];
      expect(recycleNodesInto(prevData, nextData)).toBe(nextData);
    });
  });
});
