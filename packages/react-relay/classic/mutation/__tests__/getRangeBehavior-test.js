/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @format
 */

'use strict';

const getRangeBehavior = require('../getRangeBehavior');

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

    it('allows non-string values for call arguments', () => {
      const calls = [{name: 'status', value: 1}];
      const rangeBehavior = getRangeBehavior(rangeBehaviors, calls);
      expect(rangeBehavior).toBe('refetch');
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
