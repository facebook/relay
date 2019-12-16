/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

type Handler = (name: string, callback: () => void) => void;
type ProfileHandler = (name: string, state?: any) => (error?: Error) => void;

function emptyFunction() {}

const aggregateHandlersByName: {[name: string]: Array<Handler>, ...} = {
  '*': [],
};
const profileHandlersByName: {[name: string]: Array<ProfileHandler>, ...} = {
  '*': [],
};

const NOT_INVOKED = {};
const defaultProfiler = {stop: emptyFunction};
const shouldInstrument = name => {
  if (__DEV__) {
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
 * Handlers for profiles are callbacks that return a stop method:
 *
 *   RelayProfiler.attachProfileHandler('profileName', (name, state) => {
 *     const start = performance.now();
 *     return function stop(name, state) {
 *       console.log(`Duration (${name})`, performance.now() - start);
 *     }
 *   });
 *
 * In order to reduce the impact on performance in production, instrumented
 * methods and profilers with names that begin with `@` will only be measured
 * if `__DEV__` is true. This should be used for very hot functions.
 */
const RelayProfiler = {
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
  instrumentMethods(
    object: Function | Object,
    names: {[key: string]: string, ...},
  ): void {
    for (const key in names) {
      if (names.hasOwnProperty(key)) {
        if (typeof object[key] === 'function') {
          object[key] = RelayProfiler.instrument(names[key], object[key]);
        }
      }
    }
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
  instrument<T: Function>(name: string, originalFunction: T): T {
    if (!shouldInstrument(name)) {
      originalFunction.attachHandler = emptyFunction;
      originalFunction.detachHandler = emptyFunction;
      return originalFunction;
    }
    if (!aggregateHandlersByName.hasOwnProperty(name)) {
      aggregateHandlersByName[name] = [];
    }
    const catchallHandlers = aggregateHandlersByName['*'];
    const aggregateHandlers = aggregateHandlersByName[name];
    const handlers: Array<Handler> = [];
    const contexts: Array<[number, number, number, any, any, any]> = [];
    const invokeHandlers = function() {
      const context = contexts[contexts.length - 1];
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
    const instrumentedCallback = function() {
      let returnValue;
      if (
        aggregateHandlers.length === 0 &&
        handlers.length === 0 &&
        catchallHandlers.length === 0
      ) {
        returnValue = originalFunction.apply(this, arguments);
      } else {
        contexts.push([
          catchallHandlers.length,
          aggregateHandlers.length,
          handlers.length,
          this,
          arguments,
          NOT_INVOKED,
        ]);
        invokeHandlers();
        const context = contexts.pop();
        returnValue = context[5];
        if (returnValue === NOT_INVOKED) {
          throw new Error(
            'RelayProfiler: Handler did not invoke original function.',
          );
        }
      }
      return returnValue;
    };
    instrumentedCallback.attachHandler = function(handler: Handler): void {
      handlers.push(handler);
    };
    instrumentedCallback.detachHandler = function(handler: Handler): void {
      removeFromArray(handlers, handler);
    };
    instrumentedCallback.displayName = '(instrumented ' + name + ')';
    return (instrumentedCallback: any);
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
  attachAggregateHandler(name: string, handler: Handler): void {
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
  detachAggregateHandler(name: string, handler: Handler): void {
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
  profile(name: string, state?: any): {stop: (error?: Error) => void, ...} {
    const hasCatchAllHandlers = profileHandlersByName['*'].length > 0;
    const hasNamedHandlers = profileHandlersByName.hasOwnProperty(name);
    if (hasNamedHandlers || hasCatchAllHandlers) {
      const profileHandlers =
        hasNamedHandlers && hasCatchAllHandlers
          ? profileHandlersByName[name].concat(profileHandlersByName['*'])
          : hasNamedHandlers
          ? profileHandlersByName[name]
          : profileHandlersByName['*'];
      let stopHandlers;
      for (let ii = profileHandlers.length - 1; ii >= 0; ii--) {
        const profileHandler = profileHandlers[ii];
        const stopHandler = profileHandler(name, state);
        stopHandlers = stopHandlers || [];
        stopHandlers.unshift(stopHandler);
      }
      return {
        stop(error?: Error): void {
          if (stopHandlers) {
            stopHandlers.forEach(stopHandler => stopHandler(error));
          }
        },
      };
    }
    return defaultProfiler;
  },

  /**
   * Attaches a handler to profiles with the supplied name. You can also
   * attach to the special name '*' which is a catch all.
   */
  attachProfileHandler(name: string, handler: ProfileHandler): void {
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
  detachProfileHandler(name: string, handler: ProfileHandler): void {
    if (shouldInstrument(name)) {
      if (profileHandlersByName.hasOwnProperty(name)) {
        removeFromArray(profileHandlersByName[name], handler);
      }
    }
  },
};

function removeFromArray<T>(array: Array<T>, element: T): void {
  var index = array.indexOf(element);
  if (index !== -1) {
    array.splice(index, 1);
  }
}

module.exports = RelayProfiler;
