'use strict';

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var Promise = require('fbjs/lib/Promise');

/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayTaskQueue
 * @typechecks
 * 
 */

'use strict';

var invariant = require('fbjs/lib/invariant');

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

var RelayTaskQueue = (function () {
  function RelayTaskQueue(injectedScheduler) {
    _classCallCheck(this, RelayTaskQueue);

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

  RelayTaskQueue.prototype.enqueue = function enqueue() {
    var _this = this;

    for (var _len = arguments.length, callbacks = Array(_len), _key = 0; _key < _len; _key++) {
      callbacks[_key] = arguments[_key];
    }

    var promise = new Promise(function (resolve, reject) {
      var nextIndex = 0;
      var error = null;
      var enqueueNext = function enqueueNext(value) {
        if (error) {
          reject(error);
          return;
        }
        if (nextIndex >= callbacks.length) {
          resolve(value);
        } else {
          _this._queue.push(function () {
            enqueueNext((function () {
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
      };
      enqueueNext(undefined);
    });
    this._scheduleIfNecessary();
    return promise;
  };

  /**
   * @public
   *
   * Injects a scheduling function that is invoked with a callback that will
   * execute the next unit of work. The callback will return a promise that
   * resolves with a new callback when the next unit of work is available.
   */

  RelayTaskQueue.prototype.injectScheduler = function injectScheduler(injectedScheduler) {
    this._schedule = injectedScheduler;
  };

  RelayTaskQueue.prototype._createTaskExecutor = function _createTaskExecutor(callback) {
    var _this2 = this;

    var invoked = false;
    return function () {
      !!invoked ? process.env.NODE_ENV !== 'production' ? invariant(false, 'RelayTaskQueue: Tasks can only be executed once.') : invariant(false) : undefined;
      invoked = true;
      _this2._invokeWithinScopedQueue(callback);
      _this2._running = false;
      _this2._scheduleIfNecessary();
    };
  };

  RelayTaskQueue.prototype._invokeWithinScopedQueue = function _invokeWithinScopedQueue(callback) {
    var originalQueue = this._queue;
    this._queue = [];
    try {
      callback();
    } finally {
      Array.prototype.unshift.apply(originalQueue, this._queue);
      this._queue = originalQueue;
    }
  };

  RelayTaskQueue.prototype._scheduleIfNecessary = function _scheduleIfNecessary() {
    if (this._running) {
      return;
    }
    if (this._queue.length) {
      this._running = true;
      var executeTask = this._createTaskExecutor(this._queue.shift());
      if (this._schedule) {
        this._schedule(executeTask);
      } else {
        executeTask();
      }
    } else {
      this._running = false;
    }
  };

  return RelayTaskQueue;
})();

module.exports = RelayTaskQueue;