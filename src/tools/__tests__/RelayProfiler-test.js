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

jest.dontMock('RelayProfiler');

var RelayProfiler = require('RelayProfiler');

describe('RelayProfiler', function() {
  var DEV = __DEV__;

  var mockMethod;
  var mockObject;
  var mockDisableDEV = () => {
    window.__DEV__ = 0;
  };

  beforeEach(() => {
    jest.resetModuleRegistry();

    mockMethod = jest.genMockFunction();
    mockObject = {mockMethod: RelayProfiler.instrument('mock', mockMethod)};
  });

  afterEach(() => {
    window.__DEV__ = DEV;
  });

  describe('instance', () => {
    it('preserves context, arguments, and return value', () => {
      var expectedArgument = {};
      var expectedContext = mockObject;
      var expectedReturnValue = {};

      mockMethod.mockImplementation(function(actualArgument) {
        expect(actualArgument).toBe(expectedArgument);
        expect(this).toBe(expectedContext);
        return expectedReturnValue;
      });

      var actualReturnValue = mockObject.mockMethod(expectedArgument);

      expect(actualReturnValue).toBe(expectedReturnValue);
    });

    it('invokes attached handlers', () => {
      var actualOrdering = [];

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
        'afterCallback'
      ]);
    });

    it('invokes nested attached handlers', () => {
      var actualOrdering = [];

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
        '2: afterCallback'
      ]);
    });

    it('does not invoke detached handlers', () => {
      var mockHandler = jest.genMockFunction()
        .mockImplementation((name, callback) => {
          callback();
        });

      mockObject.mockMethod.attachHandler(mockHandler);
      mockObject.mockMethod.detachHandler(mockHandler);
      mockObject.mockMethod();

      expect(mockHandler).not.toBeCalled();
    });

    it('throws if callback is not invoked by handler', () => {
      mockObject.mockMethod.attachHandler(jest.genMockFunction());

      expect(() => {
        mockObject.mockMethod();
      }).toThrow('RelayProfiler: Handler did not invoke original function.');
    });

    it('does nothing unless __DEV__', () => {
      mockDisableDEV();

      mockMethod = jest.genMockFunction();
      mockObject = {mockMethod: RelayProfiler.instrument('mock', mockMethod)};

      expect(mockObject.mockMethod).toBe(mockMethod);
      expect(() => {
        mockObject.mockMethod.attachHandler();
        mockObject.mockMethod.detachHandler();
      }).not.toThrow();
    });
  });

  describe('aggregate', () => {
    it('invokes aggregate handlers first', () => {
      var actualOrdering = [];

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

      expect(actualOrdering).toEqual([
        '4: beforeCallback (aggregate)',
        '3: beforeCallback (aggregate)',
        '2: beforeCallback',
        '1: beforeCallback',
        '0: mockMethod',
        '1: afterCallback',
        '2: afterCallback',
        '3: afterCallback (aggregate)',
        '4: afterCallback (aggregate)'
      ]);
    });

    it('aggregates methods instrumented after being attached', () => {
      var mockHandler = jest.genMockFunction()
        .mockImplementation((name, callback) => {
          callback();
        });
      RelayProfiler.attachAggregateHandler('mockFuture', mockHandler);

      var mockFutureMethod = RelayProfiler.instrument('mockFuture', mockMethod);

      expect(mockHandler).not.toBeCalled();
      mockFutureMethod();
      expect(mockHandler).toBeCalled();
    });

    it('detaches aggregate handlers', () => {
      var mockHandler = jest.genMockFunction()
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
      var actualOrdering = [];

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

      var profiler = RelayProfiler.profile('mockBehavior');

      expect(actualOrdering).toEqual([
        '2: beforeEnd',
        '1: beforeEnd',
      ]);

      profiler.stop();

      expect(actualOrdering).toEqual([
        '2: beforeEnd',
        '1: beforeEnd',
        '1: afterEnd',
        '2: afterEnd'
      ]);
    });

    it('does not invoke detached profile handlers', () => {
      var mockStop = jest.genMockFunction();
      var mockStart = jest.genMockFunction().mockReturnValue(mockStop);

      RelayProfiler.attachProfileHandler('mockBehavior', mockStart);
      RelayProfiler.detachProfileHandler('mockBehavior', mockStart);
      RelayProfiler.profile('mockBehavior');

      expect(mockStop).not.toBeCalled();
      expect(mockStart).not.toBeCalled();
    });

    it('passes state to each profile handler', () => {
      var mockStop = jest.genMockFunction();
      var mockStart = jest.genMockFunction().mockReturnValue(mockStop);
      var state = {};

      RelayProfiler.attachProfileHandler('mockBehavior', mockStart);
      var profiler = RelayProfiler.profile('mockBehavior', state);
      profiler.stop();

      expect(mockStart).toBeCalledWith('mockBehavior', state);
      expect(mockStop).toBeCalled();
      expect(mockStop.mock.calls[0].length).toBe(0);
    });
  });
});
