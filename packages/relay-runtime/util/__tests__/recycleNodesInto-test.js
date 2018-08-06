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

const recycleNodesInto = require('../recycleNodesInto');

describe('recycleNodesInto', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  describe('scalars', () => {
    it('ignores when `prevData` is null or undefined', () => {
      const nextData = {};
      expect(recycleNodesInto(null, nextData)).toBe(nextData);
      expect(recycleNodesInto(undefined, nextData)).toBe(nextData);
    });

    it('returns when `nextData` is null or undefined', () => {
      const prevData = {};
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
      const prevData = {foo: 1};
      const nextData = {foo: 1};
      expect(recycleNodesInto(prevData, nextData)).toBe(prevData);
    });

    it('recycles parent objects with equal leaf objects', () => {
      const prevData = {foo: {bar: 1}};
      const nextData = {foo: {bar: 1}};
      expect(recycleNodesInto(prevData, nextData)).toBe(prevData);
    });

    it('does not recycle unequal leaf objects', () => {
      const prevData = {foo: 1};
      const nextData = {foo: 100};
      expect(recycleNodesInto(prevData, nextData)).not.toBe(prevData);
    });

    it('does not recycle parent objects with unequal leaf objects', () => {
      const prevData = {foo: {bar: 1}};
      const nextData = {foo: {bar: 100}};
      expect(recycleNodesInto(prevData, nextData)).not.toBe(prevData);
    });

    it('does not recycle object with fewer properties', () => {
      const prevData = {foo: 1};
      const nextData = {foo: 1, bar: 2};
      expect(recycleNodesInto(prevData, nextData)).not.toBe(prevData);
    });

    it('does not recycle object with more properties', () => {
      const prevData = {foo: 1, bar: 2};
      const nextData = {foo: 1};
      expect(recycleNodesInto(prevData, nextData)).toEqual({foo: 1});
    });

    it('recycles equal leaf objects with unequal parent objects', () => {
      const prevData = {foo: {bar: 1}, baz: 2};
      const nextData = {foo: {bar: 1}, baz: 200};
      const recycled = recycleNodesInto(prevData, nextData);

      expect(recycled).not.toBe(prevData);
      expect(recycled.bar).toBe(prevData.bar);
    });

    it('recycles identical objects', () => {
      const prevData = {foo: {bar: 1}, baz: 2};
      // "next" data should not be modified if it is === to previous data
      Object.freeze(prevData);
      Object.freeze(prevData.foo);
      const recycled = recycleNodesInto(prevData, prevData);
      expect(recycled).toBe(prevData);
    });

    it('recycles identical leaves', () => {
      const prevData = {foo: 1};
      const nextData = {foo: 1};
      // "next" data should not be modified if it is === to previous data
      Object.freeze(nextData);
      const recycled = recycleNodesInto(prevData, nextData);
      expect(recycled).toBe(prevData);
    });

    it('does not recycle arrays as objects', () => {
      const prevData = [1, 2];
      const nextData = {0: 1, 1: 2};
      expect(recycleNodesInto(prevData, nextData)).not.toBe(prevData);
    });
  });

  describe('arrays', () => {
    it('recycles arrays with equal scalars', () => {
      const prevData = [1, 2, 3];
      const nextData = [1, 2, 3];
      Object.freeze(prevData);
      Object.freeze(nextData);
      expect(recycleNodesInto(prevData, nextData)).toBe(prevData);
    });

    it('does not recycle arrays with unequal scalars', () => {
      const prevData = [1, 2, 3];
      const nextData = [4, 5, 6];
      Object.freeze(prevData);
      Object.freeze(nextData);
      expect(recycleNodesInto(prevData, nextData)).not.toBe(prevData);
    });

    it('recycles arrays with equal objects without mutating `prevData`', () => {
      const prevData = [{foo: 1}, {bar: 2}];
      const nextData = [{foo: 1}, {bar: 2}];
      expect(recycleNodesInto(prevData, nextData)).toBe(prevData);
    });

    it('recycles arrays without mutating `prevData`', () => {
      const prevItem = {foo: 1};
      const prevData = [prevItem];
      const nextData = [{foo: 1}];
      const recycled = recycleNodesInto(prevData, nextData);

      expect(recycled).toBe(prevData);
      expect(recycled[0]).toBe(prevItem);
    });

    it('recycles arrays with equal objects but unequal parent objects', () => {
      const prevData = {foo: [{foo: 1}, {bar: 2}], qux: 3};
      const nextData = {foo: [{foo: 1}, {bar: 2}], qux: 300};
      const recycled = recycleNodesInto(prevData, nextData);

      expect(recycled).not.toBe(prevData);
      expect(recycled.foo).toBe(prevData.foo);
    });

    it('recycles equal objects from an array with unequal siblings', () => {
      const prevData = [{foo: 1}, {bar: 2}];
      const nextData = [{foo: 1}, {bar: 200}];
      const recycled = recycleNodesInto(prevData, nextData);

      expect(recycled).not.toBe(prevData);
      expect(recycled[0]).toBe(prevData[0]);
      expect(recycled[1]).not.toBe(prevData[1]);
    });

    it('recycles equal objects from an array with fewer siblings', () => {
      const prevData = [{foo: 1}];
      const nextData = [{foo: 1}, {bar: 2}];
      const recycled = recycleNodesInto(prevData, nextData);

      expect(recycled).not.toBe(prevData);
      expect(recycled[0]).toBe(prevData[0]);
      expect(recycled[1]).toEqual({bar: 2});
    });

    it('recycles equal objects from an array with more siblings', () => {
      const prevData = [{foo: 1}, {bar: 2}];
      const nextData = [{foo: 1}];
      const recycled = recycleNodesInto(prevData, nextData);

      expect(recycled).not.toBe(prevData);
      expect(recycled[0]).toBe(prevData[0]);
      expect(recycled.length).toBe(1);
    });

    it('does not recycle objects as arrays', () => {
      const prevData = Object.assign(Object.create({length: 2}), {0: 1, 1: 2});
      const nextData = [1, 2];
      expect(recycleNodesInto(prevData, nextData)).not.toBe(prevData);
    });
  });
});
