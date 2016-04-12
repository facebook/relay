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

jest.dontMock('RelayProfiler');

const RelayProfiler = require('RelayProfiler');

describe('RelayProfiler', function() {
  const DEV = __DEV__;

  let mockMethod;
  let mockObject;
  const mockDisableDEV = () => {
    window.__DEV__ = 0;
  };

  beforeEach(() => {
    jest.resetModuleRegistry();

    mockMethod = jest.fn();
    const mockMethod2 = jest.fn();
    mockObject = {
      mockMethod: RelayProfiler.instrument('mock', mockMethod),
      mockMethod2: RelayProfiler.instrument('mock2', mockMethod2),
    };
  });

  afterEach(() => {
    window.__DEV__ = DEV;
  });

  describe('instance', () => {
    it('preserves context, arguments, and return value', () => {
      const expectedArgument = {};
      const expectedContext = mockObject;
      const expectedReturnValue = {};

      mockMethod.mockImplementation(function(actualArgument) {
        expect(actualArgument).toBe(expectedArgument);
        expect(this).toBe(expectedContext);
        return expectedReturnValue;
      });

      const actualReturnValue = mockObject.mockMethod(expectedArgument);

      expect(actualReturnValue).toBe(expectedReturnValue);
    });

    it('invokes attached handlers', () => {
      const actualOrdering = [];

      mockMethod.mockImplementation(() => {
        actualOrdering.push('mockMethod');
      });

      mockObject.mockMethod.attachHandler((name, callback) => {
        expect(name).toBe('mock');
        actualOrdering.push('beforeCallback');
        callback();
        actualOrdering.push('afterCallback');
      });

      mockObject.mockMethod();

      expect(actualOrdering).toEqual([
        'beforeCallback',
        'mockMethod',
        'afterCallback',
      ]);
    });

    it('invokes nested attached handlers', () => {
      const actualOrdering = [];

      mockMethod.mockImplementation(() => {
        actualOrdering.push('0: mockMethod');
      });

      mockObject.mockMethod.attachHandler((name, callback) => {
        expect(name).toBe('mock');
        actualOrdering.push('1: beforeCallback');
        callback();
        actualOrdering.push('1: afterCallback');
      });

      mockObject.mockMethod.attachHandler((name, callback) => {
        expect(name).toBe('mock');
        actualOrdering.push('2: beforeCallback');
        callback();
        actualOrdering.push('2: afterCallback');
      });

      mockObject.mockMethod();

      expect(actualOrdering).toEqual([
        '2: beforeCallback',
        '1: beforeCallback',
        '0: mockMethod',
        '1: afterCallback',
        '2: afterCallback',
      ]);
    });

    it('does not invoke detached handlers', () => {
      const mockHandler = jest.fn()
        .mockImplementation((name, callback) => {
          callback();
        });

      mockObject.mockMethod.attachHandler(mockHandler);
      mockObject.mockMethod.detachHandler(mockHandler);
      mockObject.mockMethod();

      expect(mockHandler).not.toBeCalled();
    });

    it('throws if callback is not invoked by handler', () => {
      mockObject.mockMethod.attachHandler(jest.fn());

      expect(() => {
        mockObject.mockMethod();
      }).toThrowError(
        'RelayProfiler: Handler did not invoke original function.'
      );
    });

    it('ignores names starting with "@" unless __DEV__', () => {
      mockDisableDEV();

      mockMethod = jest.fn();
      mockObject = {mockMethod: RelayProfiler.instrument('@mock', mockMethod)};

      expect(mockObject.mockMethod).toBe(mockMethod);
      expect(() => {
        mockObject.mockMethod.attachHandler();
        mockObject.mockMethod.detachHandler();
      }).not.toThrow();
    });

    it('instruments names without "@" when not in __DEV__', () => {
      mockDisableDEV();

      mockMethod = jest.fn();
      mockObject = {mockMethod: RelayProfiler.instrument('mock', mockMethod)};

      expect(mockObject.mockMethod).not.toBe(mockMethod);
    });
  });

  describe('aggregate', () => {
    it('invokes aggregate handlers first', () => {
      const actualOrdering = [];

      mockMethod.mockImplementation(() => {
        actualOrdering.push('0: mockMethod');
      });

      mockObject.mockMethod.attachHandler((name, callback) => {
        actualOrdering.push('1: beforeCallback');
        callback();
        actualOrdering.push('1: afterCallback');
      });

      RelayProfiler.attachAggregateHandler('mock', (name, callback) => {
        expect(name).toBe('mock');
        actualOrdering.push('3: beforeCallback (aggregate)');
        callback();
        actualOrdering.push('3: afterCallback (aggregate)');
      });

      RelayProfiler.attachAggregateHandler('*', (name, callback) => {
        actualOrdering.push('5: beforeCallback (aggregate *): ' + name);
        callback();
        actualOrdering.push('5: afterCallback (aggregate *): ' + name);
      });

      RelayProfiler.attachAggregateHandler('mock', (name, callback) => {
        expect(name).toBe('mock');
        actualOrdering.push('4: beforeCallback (aggregate)');
        callback();
        actualOrdering.push('4: afterCallback (aggregate)');
      });

      mockObject.mockMethod.attachHandler((name, callback) => {
        actualOrdering.push('2: beforeCallback');
        callback();
        actualOrdering.push('2: afterCallback');
      });

      mockObject.mockMethod();
      mockObject.mockMethod2();

      expect(actualOrdering).toEqual([
        '5: beforeCallback (aggregate *): mock',
        '4: beforeCallback (aggregate)',
        '3: beforeCallback (aggregate)',
        '2: beforeCallback',
        '1: beforeCallback',
        '0: mockMethod',
        '1: afterCallback',
        '2: afterCallback',
        '3: afterCallback (aggregate)',
        '4: afterCallback (aggregate)',
        '5: afterCallback (aggregate *): mock',
        '5: beforeCallback (aggregate *): mock2',
        '5: afterCallback (aggregate *): mock2',
      ]);
    });

    it('aggregates methods instrumented after being attached', () => {
      const mockHandler = jest.fn()
        .mockImplementation((name, callback) => {
          callback();
        });
      RelayProfiler.attachAggregateHandler('mockFuture', mockHandler);

      const mockFutureMethod = RelayProfiler.instrument('mockFuture', mockMethod);

      expect(mockHandler).not.toBeCalled();
      mockFutureMethod();
      expect(mockHandler).toBeCalled();
    });

    it('detaches aggregate handlers', () => {
      const mockHandler = jest.fn()
        .mockImplementation((name, callback) => {
          callback();
        });

      RelayProfiler.attachAggregateHandler('mock', mockHandler);
      RelayProfiler.detachAggregateHandler('mock', mockHandler);
      mockObject.mockMethod();

      expect(mockHandler).not.toBeCalled();
    });
  });

  describe('profile', () => {
    it('invokes attached profile handlers', () => {
      const actualOrdering = [];

      RelayProfiler.attachProfileHandler('mockBehavior', (name) => {
        expect(name).toBe('mockBehavior');
        actualOrdering.push('1: beforeEnd');
        return () => {
          actualOrdering.push('1: afterEnd');
        };
      });

      RelayProfiler.attachProfileHandler('mockBehavior', (name) => {
        expect(name).toBe('mockBehavior');
        actualOrdering.push('2: beforeEnd');
        return () => {
          actualOrdering.push('2: afterEnd');
        };
      });

      const profiler = RelayProfiler.profile('mockBehavior');

      expect(actualOrdering).toEqual([
        '2: beforeEnd',
        '1: beforeEnd',
      ]);

      profiler.stop();

      expect(actualOrdering).toEqual([
        '2: beforeEnd',
        '1: beforeEnd',
        '1: afterEnd',
        '2: afterEnd',
      ]);
    });

    it('does not invoke detached profile handlers', () => {
      const mockStop = jest.fn();
      const mockStart = jest.fn(() => mockStop);

      RelayProfiler.attachProfileHandler('mockBehavior', mockStart);
      RelayProfiler.detachProfileHandler('mockBehavior', mockStart);
      RelayProfiler.profile('mockBehavior');

      expect(mockStop).not.toBeCalled();
      expect(mockStart).not.toBeCalled();
    });

    it('passes state to each profile handler', () => {
      const mockStop = jest.fn();
      const mockStart = jest.fn(() => mockStop);
      const state = {};

      RelayProfiler.attachProfileHandler('mockBehavior', mockStart);
      const profiler = RelayProfiler.profile('mockBehavior', state);
      profiler.stop();

      expect(mockStart).toBeCalledWith('mockBehavior', state);
      expect(mockStop).toBeCalled();
      expect(mockStop.mock.calls[0].length).toBe(0);
    });
  });
});
