/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayTaskQueue
 * @flow
 * @format
 */

'use strict';

const invariant = require('invariant');

type TaskCallback = () => void;

export type TaskExecutor = () => void;
export type TaskScheduler = (executeTask: TaskExecutor) => void;

/**
 * A task queue that can be configured with an optional scheduler function. The
 * scheduling function is invoked with a callback that will execute the next
 * unit of work. The callback will return a promise that resolves with a new
 * callback when the next unit of work is available. For example, a scheduler
 * can defer each task to the next animation frame:
 *
 *   new RelayTaskQueue(executeTask => {
 *     // This function will be invoked whenever a task is enqueued. It will not
 *     // be invoked again until `executeTask` has been invoked. Also, invoking
 *     // `executeTask` more than once is an error.
 *     requestAnimationFrame(executeTask);
 *   });
 *
 * By default, the next task is executed synchronously after the previous one is
 * finished. An injected scheduler using `setImmediate` can alter this behavior.
 */
class RelayTaskQueue {
  _queue: Array<TaskCallback>;
  _running: boolean;
  _schedule: ?TaskScheduler;

  constructor(injectedScheduler: ?TaskScheduler): void {
    this._queue = [];
    this._running = false;
    this._schedule = injectedScheduler;
  }

  /**
   * @internal
   *
   * Enqueues one or more callbacks that each represent a synchronous unit of
   * work that can be scheduled to be executed at a later time.
   *
   * The return value of each callback will be passed in as an argument to the
   * next callback. If one of the callbacks throw an error, the execution will
   * be aborted and the returned promise be rejected with the thrown error.
   * Otherwise, the returned promise will be resolved with the return value of
   * the last callback. For example:
   *
   *   const taskQueue = new RelayTaskQueue();
   *   taskQueue.enqueue(
   *     function() {
   *       return 'foo';
   *     },
   *     function(foo) {
   *       return 'bar';
   *     }
   *   ).done(
   *     function(bar) {
   *       // ...
   *     }
   *   );
   *
   *   RelayTaskQueue.enqueue(
   *     function() {
   *       return 'foo';
   *     },
   *     function(foo) {
   *       throw new Error();
   *     },
   *     function() {
   *       // Never executed.
   *     }
   *   ).catch(
   *     function(error) {}
   *   );
   */
  enqueue(...callbacks: Array<(value: any) => any>): Promise<any> {
    const promise = new Promise((resolve, reject) => {
      let nextIndex = 0;
      let error = null;
      const enqueueNext = (value: any): void => {
        if (error) {
          reject(error);
          return;
        }
        if (nextIndex >= callbacks.length) {
          resolve(value);
        } else {
          this._queue.push((): void => {
            enqueueNext(
              ((): any => {
                const nextCallback = callbacks[nextIndex++];
                try {
                  value = nextCallback(value);
                } catch (e) {
                  error = e;
                  value = undefined;
                }
                return value;
              })(),
            );
          });
        }
      };
      enqueueNext(undefined);
    });
    this._scheduleIfNecessary();
    return promise;
  }

  /**
   * @public
   *
   * Injects a scheduling function that is invoked with a callback that will
   * execute the next unit of work. The callback will return a promise that
   * resolves with a new callback when the next unit of work is available.
   */
  injectScheduler(injectedScheduler: ?TaskScheduler): void {
    this._schedule = injectedScheduler;
  }

  _createTaskExecutor(callback: TaskCallback): TaskExecutor {
    let invoked = false;
    return () => {
      invariant(!invoked, 'RelayTaskQueue: Tasks can only be executed once.');
      invoked = true;
      this._invokeWithinScopedQueue(callback);
      this._running = false;
      this._scheduleIfNecessary();
    };
  }

  _invokeWithinScopedQueue(callback: TaskCallback): void {
    const originalQueue = this._queue;
    this._queue = [];
    try {
      callback();
    } finally {
      Array.prototype.unshift.apply(originalQueue, this._queue);
      this._queue = originalQueue;
    }
  }

  _scheduleIfNecessary(): void {
    if (this._running) {
      return;
    }
    if (this._queue.length) {
      this._running = true;
      const executeTask = this._createTaskExecutor(this._queue.shift());
      if (this._schedule) {
        this._schedule(executeTask);
      } else {
        executeTask();
      }
    } else {
      this._running = false;
    }
  }
}

module.exports = RelayTaskQueue;
