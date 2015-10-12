/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayTaskScheduler
 * @typechecks
 * @flow
 */

'use strict';

var Promise = require('Promise');

var invariant = require('invariant');

type TaskCallback = () => void;
type TaskExecutor = () => void;

var queue: Array<TaskCallback> = [];
var schedule: ?(executeTask: TaskExecutor) => void;
var running: boolean = false;

/**
 * Task scheduler used by Relay internals. Each task is a synchronous unit of
 * work that can be deferred by an injected scheduler function. For example,
 * an injected scheduler can defer each task to the next animation frame:
 *
 *   RelayTaskScheduler.injectScheduler(function(executeTask) {
 *     // This function will be invoked whenever a task is enqueued. It will not
 *     // be invoked again until `executeTask` has been invoked. Also, invoking
 *     // `executeTask` more than once is an error.
 *     requestAnimationFrame(executeTask);
 *   });
 *
 * By default, the next task is executed synchronously after the previous one is
 * finished. An injected scheduler using `setImmediate` can alter this behavior.
 */
var RelayTaskScheduler = {
  /**
   * @public
   *
   * Injects a scheduling function that is invoked with a callback that will
   * execute the next unit of work. The callback will return a promise that
   * resolves with a new callback when the next unit of work is available.
   */
  injectScheduler: function(
    injectedScheduler: (executeTask: TaskExecutor) => void
  ): void {
    schedule = injectedScheduler;
  },

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
   *   RelayTaskScheduler.await(
   *     function() {
   *       return 'foo';
   *     },
   *     function(foo) {
   *       return 'bar';
   *     }
   *   ).then(
   *     function(bar) {
   *       // ...
   *     }
   *   );
   *
   *   RelayTaskScheduler.await(
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
  await: function(...callbacks: Array<(value: any) => any>): Promise<any> {
    var promise = new Promise((resolve, reject) => {
      var nextIndex = 0;
      var error = null;
      function enqueueNext(value: any): void {
        if (error) {
          reject(error);
          return;
        }
        if (nextIndex >= callbacks.length) {
          resolve(value);
        } else {
          queue.push(function(): void {
            enqueueNext((function(): any {
              var nextCallback = callbacks[nextIndex++];
              try {
                value = nextCallback(value);
              } catch (e) {
                error = e;
                value = undefined;
              }
              return value;
            })());
          });
        }
      }
      enqueueNext(undefined);
    });
    scheduleIfNecessary();
    return promise;
  }
};

function scheduleIfNecessary(): void {
  if (running) {
    return;
  }
  if (queue.length) {
    running = true;
    var executeTask = createTaskExecutor(queue.shift());
    if (schedule) {
      schedule(executeTask);
    } else {
      executeTask();
    }
  } else {
    running = false;
  }
}

function createTaskExecutor(callback: TaskCallback): TaskExecutor {
  var invoked = false;
  return function() {
    invariant(!invoked, 'RelayTaskScheduler: Tasks can only be executed once.');
    invoked = true;
    invokeWithinScopedQueue(callback);
    running = false;
    scheduleIfNecessary();
  };
}

function invokeWithinScopedQueue(callback: TaskCallback): void {
  var originalQueue = queue;
  queue = [];
  try {
    callback();
  } finally {
    Array.prototype.unshift.apply(originalQueue, queue);
    queue = originalQueue;
  }
}

module.exports = RelayTaskScheduler;
