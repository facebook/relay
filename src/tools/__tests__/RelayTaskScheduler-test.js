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

jest.dontMock('RelayTaskScheduler');

const RelayTaskScheduler = require('RelayTaskScheduler');
const RelayTestUtils = require('RelayTestUtils');
const resolveImmediate = require('resolveImmediate');

describe('RelayTaskScheduler', () => {
  beforeEach(() => {
    jest.resetModuleRegistry();

    jasmine.addMatchers(RelayTestUtils.matchers);
  });

  describe('default scheduler', () => {
    it('resolves to undefined when no callbacks are supplied', () => {
      var mockFunction = jest.genMockFunction();
      RelayTaskScheduler.enqueue().then(mockFunction);

      jest.runAllTimers();

      expect(mockFunction).toBeCalledWith(undefined);
    });

    it('immediately invokes tasks', () => {
      var mockFunction = jest.genMockFunction();
      RelayTaskScheduler.enqueue(mockFunction);

      jest.runAllTimers();

      expect(mockFunction).toBeCalled();
    });

    it('invokes multiple enqueued tasks in order', () => {
      var mockOrdering = [];

      RelayTaskScheduler.enqueue(() => mockOrdering.push('foo'));
      RelayTaskScheduler.enqueue(() => mockOrdering.push('bar'));
      RelayTaskScheduler.enqueue(() => mockOrdering.push('baz'));

      jest.runAllTimers();

      expect(mockOrdering).toEqual(['foo', 'bar', 'baz']);
    });

    it('enqueues tasks enqueued by other tasks contiguously', () => {
      var mockOrdering = [];

      RelayTaskScheduler.enqueue(() => {
        mockOrdering.push('foo');
        RelayTaskScheduler.enqueue(() => mockOrdering.push('bar'));
      });
      // Although `baz` is enqueued before `bar`, `bar` should execute first.
      RelayTaskScheduler.enqueue(() => mockOrdering.push('baz'));

      jest.runAllTimers();

      expect(mockOrdering).toEqual(['foo', 'bar', 'baz']);
    });

    it('resolves to the task\'s return value', () => {
      var mockFunction = jest.genMockFunction();
      RelayTaskScheduler.enqueue(() => 42).then(mockFunction);

      jest.runAllTimers();

      expect(mockFunction).toBeCalledWith(42);
    });

    it('forwards return values for multiple callbacks', () => {
      var mockOrdering = [];

      RelayTaskScheduler.enqueue(
        () => {
          mockOrdering.push('foo');
          return 'bar';
        },
        prevValue => {
          mockOrdering.push(prevValue);
          return 'baz';
        }
      ).then(
        returnValue => {
          mockOrdering.push(returnValue);
        }
      );

      jest.runAllTimers();

      expect(mockOrdering).toEqual(['foo', 'bar', 'baz']);
    });

    it('aborts and rejects if a callback throws', () => {
      var mockError = new Error('Expected error.');
      var mockCallback = jest.genMockFunction();
      var mockFailureCallback = jest.genMockFunction();

      RelayTaskScheduler.enqueue(
        () => 'foo',
        () => { throw mockError; },
        mockCallback,
      ).catch(mockFailureCallback);

      jest.runAllTimers();

      expect(mockCallback).not.toBeCalled();
      expect(mockFailureCallback).toBeCalledWith(mockError);
    });

    it('does not affect next chain of callbacks after rejection', () => {
      var mockError = new Error('Expected error.');
      var mockCallback = jest.genMockFunction();
      var mockFailureCallback = jest.genMockFunction();
      var mockSuccessCallback = jest.genMockFunction();

      RelayTaskScheduler.enqueue(
        () => { throw mockError; },
      ).catch(mockFailureCallback);

      RelayTaskScheduler.enqueue(
        mockCallback,
      ).then(mockSuccessCallback);

      jest.runAllTimers();

      expect(mockFailureCallback).toBeCalledWith(mockError);
      expect(mockCallback).toBeCalled();
      expect(mockSuccessCallback).toBeCalled();
    });
  });

  describe('injected scheduler', () => {
    var mockScheduler;
    var mockTasks;

    beforeEach(() => {
      mockTasks = [];
      mockScheduler = function(executeTask) {
        resolveImmediate(() => mockTasks.push(executeTask));
      };
    });

    it('allows injection of a scheduler to defer task execution', () => {
      RelayTaskScheduler.injectScheduler(mockScheduler);

      var mockFunction = jest.genMockFunction();
      RelayTaskScheduler.enqueue(mockFunction);

      jest.runAllTimers();

      expect(mockFunction).not.toBeCalled();
      expect(mockTasks.length).toBe(1);

      // Execute the task, which should not return anything.
      expect(mockTasks[0]()).toBe(undefined);
      expect(mockFunction).toBeCalled();
    });

    it('allows an injected scheduler to defer multiple tasks', () => {
      RelayTaskScheduler.injectScheduler(mockScheduler);

      var mockOrdering = [];

      RelayTaskScheduler.enqueue(() => {
        mockOrdering.push('foo');
        RelayTaskScheduler.enqueue(() => mockOrdering.push('bar'));
      });
      RelayTaskScheduler.enqueue(() => mockOrdering.push('baz'));

      jest.runAllTimers();

      // Scheduler only sees one task at a time.
      expect(mockTasks.length).toBe(1);
      mockTasks[0]();
      expect(mockOrdering).toEqual(['foo']);

      // Scheduler only sees the next task after `resolveImmediate`.
      expect(mockTasks.length).toBe(1);

      jest.runAllTimers();

      expect(mockTasks.length).toBe(2);
      mockTasks[1]();
      expect(mockOrdering).toEqual(['foo', 'bar']);

      jest.runAllTimers();

      expect(mockTasks.length).toBe(3);
      mockTasks[2]();
      expect(mockOrdering).toEqual(['foo', 'bar', 'baz']);
    });

    it('throws if the same task is executed more than once', () => {
      RelayTaskScheduler.injectScheduler(mockScheduler);

      var mockFunction = jest.genMockFunction();
      RelayTaskScheduler.enqueue(mockFunction);

      jest.runAllTimers();

      mockTasks[0]();

      expect(() => {
        mockTasks[0]();
      }).toFailInvariant(
        'RelayTaskScheduler: Tasks can only be executed once.'
      );
    });
  });
});
