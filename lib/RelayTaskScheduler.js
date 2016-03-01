'use strict';

var Promise = require('fbjs/lib/Promise');

/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayTaskScheduler
 * @typechecks
 * 
 */

'use strict';

var RelayTaskQueue = require('./RelayTaskQueue');

var queue = undefined;
var scheduler = undefined;

/**
 * Task scheduler used by Relay internals. Each task is a synchronous unit of
 * work that can be deferred by an injected scheduler function. For example,
 * an injected scheduler can defer each task to the next animation frame:
 *
 *   RelayTaskScheduler.injectScheduler(executeTask => {
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
   *   RelayTaskScheduler.enqueue(
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
   *   RelayTaskScheduler.enqueue(
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
  enqueue: function enqueue() {
    var _queue;

    if (!queue) {
      queue = new RelayTaskQueue(scheduler);
    }
    return (_queue = queue).enqueue.apply(_queue, arguments);
  },

  /**
   * @public
   *
   * Injects a scheduling function that is invoked with a callback that will
   * execute the next unit of work. The callback will return a promise that
   * resolves with a new callback when the next unit of work is available.
   */
  injectScheduler: function injectScheduler(injectedScheduler) {
    scheduler = injectedScheduler;
    if (queue) {
      queue.injectScheduler(scheduler);
    }
  }
};

module.exports = RelayTaskScheduler;