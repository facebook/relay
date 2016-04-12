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

jest.dontMock('RelayTaskQueue');

const RelayTaskQueue = require('RelayTaskQueue');
const RelayTestUtils = require('RelayTestUtils');

const resolveImmediate = require('resolveImmediate');

describe('RelayTaskQueue', () => {
  beforeEach(() => {
    jest.resetModuleRegistry();
    jasmine.addMatchers(RelayTestUtils.matchers);
  });

  describe('default scheduler', () => {
    let taskQueue;

    beforeEach(() => {
      taskQueue = new RelayTaskQueue();
    });

    it('resolves to undefined when no callbacks are supplied', () => {
      const mockFunction = jest.fn();
      taskQueue.enqueue().done(mockFunction);
      jest.runAllTimers();
      expect(mockFunction).toBeCalledWith(undefined);
    });

    it('immediately invokes tasks', () => {
      const mockFunction = jest.fn();
      taskQueue.enqueue(mockFunction);
      jest.runAllTimers();
      expect(mockFunction).toBeCalled();
    });

    it('invokes multiple enqueued tasks in order', () => {
      const mockOrdering = [];
      taskQueue.enqueue(() => mockOrdering.push('foo'));
      taskQueue.enqueue(() => mockOrdering.push('bar'));
      taskQueue.enqueue(() => mockOrdering.push('baz'));
      jest.runAllTimers();
      expect(mockOrdering).toEqual(['foo', 'bar', 'baz']);
    });

    it('enqueues tasks enqueued by other tasks contiguously', () => {
      const mockOrdering = [];
      taskQueue.enqueue(() => {
        mockOrdering.push('foo');
        taskQueue.enqueue(() => mockOrdering.push('bar'));
      });
      // Although `baz` is enqueued before `bar`, `bar` should execute first.
      taskQueue.enqueue(() => mockOrdering.push('baz'));
      jest.runAllTimers();
      expect(mockOrdering).toEqual(['foo', 'bar', 'baz']);
    });

    it('resolves to the task\'s return value', () => {
      const mockFunction = jest.fn();
      taskQueue.enqueue(() => 42).done(mockFunction);
      jest.runAllTimers();
      expect(mockFunction).toBeCalledWith(42);
    });

    it('forwards return values for multiple callbacks', () => {
      const mockOrdering = [];
      taskQueue.enqueue(
        () => {
          mockOrdering.push('foo');
          return 'bar';
        },
        prevValue => {
          mockOrdering.push(prevValue);
          return 'baz';
        }
      ).done(
        returnValue => {
          mockOrdering.push(returnValue);
        }
      );
      jest.runAllTimers();
      expect(mockOrdering).toEqual(['foo', 'bar', 'baz']);
    });

    it('aborts and rejects if a callback throws', () => {
      const mockError = new Error('Expected error.');
      const mockCallback = jest.fn();
      const mockFailureCallback = jest.fn();
      taskQueue.enqueue(
        () => 'foo',
        () => { throw mockError; },
        mockCallback,
      ).catch(mockFailureCallback);
      jest.runAllTimers();
      expect(mockCallback).not.toBeCalled();
      expect(mockFailureCallback).toBeCalledWith(mockError);
    });

    it('does not affect next chain of callbacks after rejection', () => {
      const mockError = new Error('Expected error.');
      const mockCallback = jest.fn();
      const mockFailureCallback = jest.fn();
      const mockSuccessCallback = jest.fn();
      taskQueue.enqueue(
        () => { throw mockError; },
      ).catch(mockFailureCallback);
      taskQueue.enqueue(
        mockCallback,
      ).done(mockSuccessCallback);
      jest.runAllTimers();
      expect(mockFailureCallback).toBeCalledWith(mockError);
      expect(mockCallback).toBeCalled();
      expect(mockSuccessCallback).toBeCalled();
    });
  });

  describe('injected scheduler', () => {
    let mockTasks;
    let taskQueue;

    beforeEach(() => {
      mockTasks = [];
      const mockScheduler = (executeTask) => {
        resolveImmediate(() => mockTasks.push(executeTask));
      };
      taskQueue = new RelayTaskQueue(mockScheduler);
    });

    it('allows injection of a scheduler to defer task execution', () => {
      const mockFunction = jest.fn();
      taskQueue.enqueue(mockFunction);
      jest.runAllTimers();
      expect(mockFunction).not.toBeCalled();
      expect(mockTasks.length).toBe(1);
      // Execute the task, which should not return anything.
      expect(mockTasks[0]()).toBe(undefined);
      expect(mockFunction).toBeCalled();
    });

    it('allows an injected scheduler to defer multiple tasks', () => {
      const mockOrdering = [];
      taskQueue.enqueue(() => {
        mockOrdering.push('foo');
        taskQueue.enqueue(() => mockOrdering.push('bar'));
      });
      taskQueue.enqueue(() => mockOrdering.push('baz'));
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
      const mockFunction = jest.fn();
      taskQueue.enqueue(mockFunction);
      jest.runAllTimers();
      mockTasks[0]();
      expect(() => {
        mockTasks[0]();
      }).toFailInvariant(
        'RelayTaskQueue: Tasks can only be executed once.'
      );
    });

    it('preserves execution order despite scheduler changes', () => {
      const mockOrdering = [];
      // This task is enqueued with a scheduler that defers the work
      taskQueue.injectScheduler(resolveImmediate);
      taskQueue.enqueue(() => mockOrdering.push('foo'));
      // This task is enqueued with no scheduler
      taskQueue.injectScheduler(undefined);
      taskQueue.enqueue(() => mockOrdering.push('bar'));
      jest.runAllTimers();
      // Make sure the work units get done in order
      expect(mockOrdering).toEqual(['foo', 'bar']);
    });
  });

});
