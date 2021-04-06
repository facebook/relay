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

type ProfileHandler = (name: string, state?: any) => (error?: Error) => void;

const profileHandlersByName: {[name: string]: Array<ProfileHandler>, ...} = {
  '*': [],
};

const defaultProfiler = {
  stop() {},
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
 */
const RelayProfiler = {
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
    if (!profileHandlersByName.hasOwnProperty(name)) {
      profileHandlersByName[name] = [];
    }
    profileHandlersByName[name].push(handler);
  },

  /**
   * Detaches a handler attached via `attachProfileHandler`.
   */
  detachProfileHandler(name: string, handler: ProfileHandler): void {
    if (profileHandlersByName.hasOwnProperty(name)) {
      removeFromArray(profileHandlersByName[name], handler);
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
