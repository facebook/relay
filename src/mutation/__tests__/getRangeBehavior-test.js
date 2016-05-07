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

const getRangeBehavior = require('getRangeBehavior');

describe('getRangeBehavior()', () => {
  describe('when rangeBehaviors are defined as a function', () => {
    const rangeBehaviors = ({status}) => {
      if (status === 'any') {
        return 'append';
      } else {
        return 'refetch';
      }
    };

    it('returns the behavior to use with the connection args', () => {
      const calls = [{name: 'status', value: 'any'}];
      const rangeBehavior = getRangeBehavior(rangeBehaviors, calls);
      expect(rangeBehavior).toBe('append');
    });
  });

  describe('when rangeBehaviors are a plain object', () => {
    const rangeBehaviors = {
      'status(any)': 'append',
      '': 'prepend',
    };

    it('returns the behavior associated with the key', () => {
      const calls = [{name: 'status', value: 'any'}];
      const rangeBehavior = getRangeBehavior(rangeBehaviors, calls);
      expect(rangeBehavior).toBe('append');
    });

    it('returns null when no behavior is associated with the key', () => {
      const calls = [{name: 'status', value: 'recent'}];
      const rangeBehavior = getRangeBehavior(rangeBehaviors, calls);
      expect(rangeBehavior).toBe(null);
    });
  });
});
