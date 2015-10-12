/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayProfiler
 * @typechecks
 * @flow
 */

'use strict';

var emptyFunction = require('emptyFunction');
var forEachObject = require('forEachObject');
var removeFromArray = require('removeFromArray');

type Handler = (name: string, callback: () => void) => void;
type ProfileHandler = (name: string, state?: any) => () => void;

var aggregateHandlersByName: {[name: string]: Array<Handler>} = {};
var profileHandlersByName: {[name: string]: Array<ProfileHandler>} = {};

var NOT_INVOKED = {};
var defaultProfiler = {stop: emptyFunction};
var enableProfile = !!__DEV__;

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
 *     var start = performance.now();
 *     callback();
 *     console.log('Duration', performance.now() - start);
 *   });
 *
 * Handlers for profiles consist of callbacks for `onStart` and `onStop`:
 *
 *   var start;
 *   RelayProfiler.attachProfileHandler('profileName', {
 *     onStart: function(name, state) {
 *       start = performance.now();
 *     },
 *     onStop: function(name, state) {
 *       console.log('Duration', performance.now() - start);
 *     }
 *   });
 *
 */
var RelayProfiler = {
  /**
   * This only controls whether `profile()`, `attachProfileHandler()` and
   * `detachProfileHandler` is enabled, normal instrument methods cannot be
   * enabled if they're not enabled at module require time.
   */
  setEnableProfile(isEnabled: boolean): void {
    enableProfile = isEnabled;
  },

  /**
   * Instruments methods on a class or object. This re-assigns the method in
   * order to preserve function names in stack traces (which are detected by
   * modern debuggers via heuristics). Example usage:
   *
   *   var RelayStore = { primeCache: function() {...} };
   *   RelayProfiler.instrumentMethods(RelayStore, {
   *     primeCache: 'RelayStore.primeCache'
   *   });
   *
   *   RelayStore.primeCache.attachHandler(...);
   *
   * As a result, the methods will be replaced by wrappers that provide the
   * `attachHandler` and `detachHandler` methods.
   */
  instrumentMethods(
    object: Function | Object,
    names: {[key: string]: string}
  ): void {
    forEachObject(names, (name, key) => {
      object[key] = RelayProfiler.instrument(name, object[key]);
    });
  },

  /**
   * Wraps the supplied function with one that provides the `attachHandler` and
   * `detachHandler` methods. Example usage:
   *
   *   var printRelayQuery =
   *     RelayProfiler.instrument('printRelayQuery', printRelayQuery);
   *
   *   printRelayQuery.attachHandler(...);
   *
   */
  instrument<T: Function>(name: string, originalFunction: T): T {
    if (__DEV__) {
      var handlers = [];
      var instrumentedCallback = function() {
        var originalReturn = NOT_INVOKED;
        var boundArguments = arguments;
        var invokeCallback = () => {
          originalReturn = originalFunction.apply(this, boundArguments);
        };
        var wrapCallback = handler => {
          invokeCallback = handler.bind(this, name, invokeCallback);
        };
        handlers.forEach(wrapCallback);
        if (aggregateHandlersByName.hasOwnProperty(name)) {
          aggregateHandlersByName[name].forEach(wrapCallback);
        }
        invokeCallback();
        if (originalReturn === NOT_INVOKED) {
          throw new Error(
            'RelayProfiler: Handler did not invoke original function.'
          );
        }
        return originalReturn;
      };
      instrumentedCallback.attachHandler = function(handler: Handler): void {
        handlers.push(handler);
      };
      instrumentedCallback.detachHandler = function(handler: Handler): void {
        removeFromArray(handlers, handler);
      };
      instrumentedCallback.displayName = '(instrumented ' + name + ')';
      return (instrumentedCallback: any);
    }
    originalFunction.attachHandler = emptyFunction;
    originalFunction.detachHandler = emptyFunction;
    return originalFunction;
  },

  /**
   * Attaches a handler to all methods instrumented with the supplied name.
   *
   *   function createRenderer() {
   *     return RelayProfiler.instrument('render', function() {...});
   *   }
   *   var renderA = createRenderer();
   *   var renderB = createRenderer();
   *
   *   // Only profiles `renderA`.
   *   renderA.attachHandler(...);
   *
   *   // Profiles both `renderA` and `renderB`.
   *   RelayProfiler.attachAggregateHandler('render', ...);
   *
   */
  attachAggregateHandler(name: string, handler: Handler): void {
    if (__DEV__) {
      if (!aggregateHandlersByName.hasOwnProperty(name)) {
        aggregateHandlersByName[name] = [];
      }
      aggregateHandlersByName[name].push(handler);
    }
  },

  /**
   * Detaches a handler attached via `attachAggregateHandler`.
   */
  detachAggregateHandler(name: string, handler: Handler): void {
    if (__DEV__) {
      if (aggregateHandlersByName.hasOwnProperty(name)) {
        removeFromArray(aggregateHandlersByName[name], handler);
      }
    }
  },

  /**
   * Instruments profiling for arbitrarily asynchronous code by a name.
   *
   *   var timerProfiler = RelayProfiler.profile('timeout');
   *   setTimeout(function() {
   *     timerProfiler.stop();
   *   }, 1000);
   *
   *   RelayProfiler.attachProfileHandler('timeout', ...);
   *
   * Arbitrary state can also be passed into `profile` as a second argument. The
   * attached profile handlers will receive this as the second argument.
   */
  profile(name: string, state?: any): {stop: () => void} {
    if (enableProfile) {
      if (profileHandlersByName.hasOwnProperty(name)) {
        var profileHandlers = profileHandlersByName[name];
        var stopHandlers;
        for (var ii = profileHandlers.length - 1; ii >= 0; ii--) {
          var profileHandler = profileHandlers[ii];
          var stopHandler = profileHandler(name, state);
          stopHandlers = stopHandlers || [];
          stopHandlers.unshift(stopHandler);
        }
        return {
          stop(): void {
            if (stopHandlers) {
              stopHandlers.forEach(stopHandler => stopHandler());
            }
          }
        };
      }
    }
    return defaultProfiler;
  },

  /**
   * Attaches a handler to profiles with the supplied name.
   */
  attachProfileHandler(name: string, handler: ProfileHandler): void {
    if (enableProfile) {
      if (!profileHandlersByName.hasOwnProperty(name)) {
        profileHandlersByName[name] = [];
      }
      profileHandlersByName[name].push(handler);
    }
  },

  /**
   * Detaches a handler attached via `attachProfileHandler`.
   */
  detachProfileHandler(name: string, handler: ProfileHandler): void {
    if (enableProfile) {
      if (profileHandlersByName.hasOwnProperty(name)) {
        removeFromArray(profileHandlersByName[name], handler);
      }
    }
  },

};

module.exports = RelayProfiler;
