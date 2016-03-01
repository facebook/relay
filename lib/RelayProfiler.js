/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayProfiler
 * @typechecks
 * 
 */

'use strict';

var emptyFunction = require('fbjs/lib/emptyFunction');
var forEachObject = require('fbjs/lib/forEachObject');
var removeFromArray = require('fbjs/lib/removeFromArray');

var aggregateHandlersByName = {
  '*': []
};
var profileHandlersByName = {
  '*': []
};

var NOT_INVOKED = {};
var defaultProfiler = { stop: emptyFunction };
var shouldInstrument = function shouldInstrument(name) {
  if (process.env.NODE_ENV !== 'production') {
    return true;
  }
  return name.charAt(0) !== '@';
};

/**
 * @public
 *
 * Instruments methods to allow profiling various parts of Relay. Profiling code
 * in Relay consists of three steps:
 *
 *  - Instrument the function to be profiled.
 *  - Attach handlers to the instrumented function.
 *  - Run the code which triggers the handlers.
 *
 * Handlers attached to instrumented methods are called with an instrumentation
 * name and a callback that must be synchronously executed:
 *
 *   instrumentedMethod.attachHandler(function(name, callback) {
 *     const start = performance.now();
 *     callback();
 *     console.log('Duration', performance.now() - start);
 *   });
 *
 * Handlers for profiles consist of callbacks for `onStart` and `onStop`:
 *
 *   const start;
 *   RelayProfiler.attachProfileHandler('profileName', {
 *     onStart: function(name, state) {
 *       start = performance.now();
 *     },
 *     onStop: function(name, state) {
 *       console.log('Duration', performance.now() - start);
 *     }
 *   });
 *
 * In order to reduce the impact on performance in production, instrumented
 * methods and profilers with names that begin with `@` will only be measured
 * if `__DEV__` is true. This should be used for very hot functions.
 */
var RelayProfiler = {

  /**
   * Instruments methods on a class or object. This re-assigns the method in
   * order to preserve function names in stack traces (which are detected by
   * modern debuggers via heuristics). Example usage:
   *
   *   const RelayStore = { primeCache: function() {...} };
   *   RelayProfiler.instrumentMethods(RelayStore, {
   *     primeCache: 'RelayStore.primeCache'
   *   });
   *
   *   RelayStore.primeCache.attachHandler(...);
   *
   * As a result, the methods will be replaced by wrappers that provide the
   * `attachHandler` and `detachHandler` methods.
   */
  instrumentMethods: function instrumentMethods(object, names) {
    forEachObject(names, function (name, key) {
      object[key] = RelayProfiler.instrument(name, object[key]);
    });
  },

  /**
   * Wraps the supplied function with one that provides the `attachHandler` and
   * `detachHandler` methods. Example usage:
   *
   *   const printRelayQuery =
   *     RelayProfiler.instrument('printRelayQuery', printRelayQuery);
   *
   *   printRelayQuery.attachHandler(...);
   *
   * NOTE: The instrumentation assumes that no handlers are attached or detached
   * in the course of executing another handler.
   */
  instrument: function instrument(name, originalFunction) {
    if (!shouldInstrument(name)) {
      originalFunction.attachHandler = emptyFunction;
      originalFunction.detachHandler = emptyFunction;
      return originalFunction;
    }
    if (!aggregateHandlersByName.hasOwnProperty(name)) {
      aggregateHandlersByName[name] = [];
    }
    var catchallHandlers = aggregateHandlersByName['*'];
    var aggregateHandlers = aggregateHandlersByName[name];
    var handlers = [];
    var contexts = [];
    var invokeHandlers = function invokeHandlers() {
      var context = contexts[contexts.length - 1];
      if (context[0]) {
        context[0]--;
        catchallHandlers[context[0]](name, invokeHandlers);
      } else if (context[1]) {
        context[1]--;
        aggregateHandlers[context[1]](name, invokeHandlers);
      } else if (context[2]) {
        context[2]--;
        handlers[context[2]](name, invokeHandlers);
      } else {
        context[5] = originalFunction.apply(context[3], context[4]);
      }
    };
    var instrumentedCallback = function instrumentedCallback() {
      var returnValue = undefined;
      if (aggregateHandlers.length === 0 && handlers.length === 0 && catchallHandlers.length == 0) {
        returnValue = originalFunction.apply(this, arguments);
      } else {
        contexts.push([catchallHandlers.length, aggregateHandlers.length, handlers.length, this, arguments, NOT_INVOKED]);
        invokeHandlers();
        var context = contexts.pop();
        returnValue = context[5];
        if (returnValue === NOT_INVOKED) {
          throw new Error('RelayProfiler: Handler did not invoke original function.');
        }
      }
      return returnValue;
    };
    instrumentedCallback.attachHandler = function (handler) {
      handlers.push(handler);
    };
    instrumentedCallback.detachHandler = function (handler) {
      removeFromArray(handlers, handler);
    };
    instrumentedCallback.displayName = '(instrumented ' + name + ')';
    return instrumentedCallback;
  },

  /**
   * Attaches a handler to all methods instrumented with the supplied name.
   *
   *   function createRenderer() {
   *     return RelayProfiler.instrument('render', function() {...});
   *   }
   *   const renderA = createRenderer();
   *   const renderB = createRenderer();
   *
   *   // Only profiles `renderA`.
   *   renderA.attachHandler(...);
   *
   *   // Profiles both `renderA` and `renderB`.
   *   RelayProfiler.attachAggregateHandler('render', ...);
   *
   */
  attachAggregateHandler: function attachAggregateHandler(name, handler) {
    if (shouldInstrument(name)) {
      if (!aggregateHandlersByName.hasOwnProperty(name)) {
        aggregateHandlersByName[name] = [];
      }
      aggregateHandlersByName[name].push(handler);
    }
  },

  /**
   * Detaches a handler attached via `attachAggregateHandler`.
   */
  detachAggregateHandler: function detachAggregateHandler(name, handler) {
    if (shouldInstrument(name)) {
      if (aggregateHandlersByName.hasOwnProperty(name)) {
        removeFromArray(aggregateHandlersByName[name], handler);
      }
    }
  },

  /**
   * Instruments profiling for arbitrarily asynchronous code by a name.
   *
   *   const timerProfiler = RelayProfiler.profile('timeout');
   *   setTimeout(function() {
   *     timerProfiler.stop();
   *   }, 1000);
   *
   *   RelayProfiler.attachProfileHandler('timeout', ...);
   *
   * Arbitrary state can also be passed into `profile` as a second argument. The
   * attached profile handlers will receive this as the second argument.
   */
  profile: function profile(name, state) {
    var hasCatchAllHandlers = profileHandlersByName['*'].length > 0;
    var hasNamedHandlers = profileHandlersByName.hasOwnProperty(name);
    if (hasNamedHandlers || hasCatchAllHandlers) {
      var _ret = (function () {
        var profileHandlers = hasNamedHandlers && hasCatchAllHandlers ? profileHandlersByName[name].concat(profileHandlersByName['*']) : hasNamedHandlers ? profileHandlersByName[name] : profileHandlersByName['*'];
        var stopHandlers = undefined;
        for (var ii = profileHandlers.length - 1; ii >= 0; ii--) {
          var profileHandler = profileHandlers[ii];
          var stopHandler = profileHandler(name, state);
          stopHandlers = stopHandlers || [];
          stopHandlers.unshift(stopHandler);
        }
        return {
          v: {
            stop: function stop() {
              if (stopHandlers) {
                stopHandlers.forEach(function (stopHandler) {
                  return stopHandler();
                });
              }
            }
          }
        };
      })();

      if (typeof _ret === 'object') return _ret.v;
    }
    return defaultProfiler;
  },

  /**
   * Attaches a handler to profiles with the supplied name. You can also
   * attach to the special name '*' which is a catch all.
   */
  attachProfileHandler: function attachProfileHandler(name, handler) {
    if (shouldInstrument(name)) {
      if (!profileHandlersByName.hasOwnProperty(name)) {
        profileHandlersByName[name] = [];
      }
      profileHandlersByName[name].push(handler);
    }
  },

  /**
   * Detaches a handler attached via `attachProfileHandler`.
   */
  detachProfileHandler: function detachProfileHandler(name, handler) {
    if (shouldInstrument(name)) {
      if (profileHandlersByName.hasOwnProperty(name)) {
        removeFromArray(profileHandlersByName[name], handler);
      }
    }
  }

};

module.exports = RelayProfiler;