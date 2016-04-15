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

jest.dontMock('getRangeBehavior');
const RelayTestUtils = require('RelayTestUtils');
const getRangeBehavior = require('getRangeBehavior');

describe('getRangeBehavior()', () => {
  describe('when rangeBehaviors are defined as a function', () => {
    const rangeBehaviors = ({status}) => {
      if (status === 'any') {
        return 'append';
      } else {
        return 'refetch';
      }
    }

    it('returns the rangeBehavior to use with the connectionArgs', () => {
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

    it('returns the rangeBehavior associated with the rangeBehaviorKey', () => {
      const calls = [{name: 'status', value: 'any'}];
      const rangeBehavior = getRangeBehavior(rangeBehaviors, calls);
      expect(rangeBehavior).toBe('append');
    });
  });
});
 
