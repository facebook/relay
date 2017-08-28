/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayObservable
 * @flow
 * @format
 */

'use strict';

const isPromise = require('isPromise');

import type {Disposable} from 'RelayCombinedEnvironmentTypes';
import type {Observer as LegacyObserver} from 'RelayStoreTypes';

export type Subscription = {
  unsubscribe: () => void,
};

type Observer<T> = {
  start?: ?(Subscription) => mixed,
  next?: ?(T) => mixed,
  error?: ?(Error) => mixed,
  complete?: ?() => mixed,
  unsubscribe?: ?(Subscription) => mixed,
};

type Sink<T> = {|
  +next: T => void,
  +error: Error => void,
  +complete: () => void,
|};

type Source_<T, SinkOfT: Sink<T>> = SinkOfT =>
  | void
  | Subscription
  | (() => mixed);
type Source<T> = Source_<T, *>;

export interface Subscribable<T> {
  subscribe(observer: Observer<T>): Subscription,
}

// Note: This should accept Subscribable<T> instead of RelayObservable<T>,
// however Flow cannot yet distinguish it from T.
export type ObservableFromValue<T> =
  | RelayObservable<T>
  | Promise<T>
  | Error
  | T;

let hostReportError;

/**
 * Limited implementation of ESObservable, providing the limited set of behavior
 * Relay networking requires.
 *
 * Observables retain the benefit of callbacks which can be called
 * synchronously, avoiding any UI jitter, while providing a compositional API,
 * which simplifies logic and prevents mishandling of errors compared to
 * the direct use of callback functions.
 *
 * ESObservable: https://github.com/tc39/proposal-observable
 */
class RelayObservable<T> implements Subscribable<T> {
  _source: Source<T>;

  constructor(source: Source<T>): void {
    if (__DEV__) {
      // Early runtime errors for ill-formed sources.
      if (!source || typeof source !== 'function') {
        throw new Error('Source must be a Function: ' + String(source));
      }
    }
    this._source = source;
  }

  /**
   * When an unhandled error is detected, it is reported to the host environment
   * (the ESObservable spec refers to this method as "HostReportErrors()").
   *
   * The default implementation in development builds re-throws errors in a
   * separate frame, and from production builds does nothing (swallowing
   * uncaught errors).
   *
   * Called during application initialization, this method allows
   * application-specific handling of uncaught errors. Allowing, for example,
   * integration with error logging or developer tools.
   */
  static onUnhandledError(callback: Error => mixed): void {
    hostReportError = callback;
  }

  /**
   * Accepts various kinds of data sources, and always returns a RelayObservable
   * useful for accepting the result of a user-provided FetchFunction.
   */
  static from<V>(obj: ObservableFromValue<V>): RelayObservable<V> {
    return isObservable(obj)
      ? fromObservable(obj)
      : isPromise(obj)
        ? fromPromise(obj)
        : obj instanceof Error ? fromError(obj) : fromValue(obj);
  }

  /**
   * Creates a RelayObservable, given a function which expects a legacy
   * Relay Observer as the last argument and which returns a Disposable.
   *
   * To support migration to Observable, the function may ignore the
   * legacy Relay observer and directly return an Observable instead.
   */
  static fromLegacy<V>(
    callback: (LegacyObserver<V>) => Disposable | RelayObservable<V>,
  ): RelayObservable<V> {
    return new RelayObservable(sink => {
      const result = callback({
        onNext: sink.next,
        onError: sink.error,
        onCompleted: sink.complete,
      });
      return isObservable(result)
        ? result.subscribe(sink)
        : () => result.dispose();
    });
  }

  /**
   * Similar to promise.catch(), observable.catch() handles error events, and
   * provides an alternative observable to use in it's place.
   *
   * If the catch handler throws a new error, it will appear as an error event
   * on the resulting Observable.
   */
  catch<U>(fn: Error => RelayObservable<U>): RelayObservable<T | U> {
    return new RelayObservable(sink => {
      let subscription;
      this.subscribe({
        start: sub => {
          subscription = sub;
        },
        next: sink.next,
        complete: sink.complete,
        error(error) {
          try {
            fn(error).subscribe({
              start: sub => {
                subscription = sub;
              },
              next: sink.next,
              complete: sink.complete,
              error: sink.error,
            });
          } catch (error2) {
            sink.error(error2);
          }
        },
      });
      return () => subscription.unsubscribe();
    });
  }

  /**
   * Returns a new Observable which returns the same values as this one, but
   * modified so that the provided Observer is called to perform a side-effects
   * for all events emitted by the source.
   *
   * Any errors that are thrown in the side-effect Observer are unhandled, and
   * do not effect the source Observable or its Observer.
   *
   * This is useful for when debugging your Observables or performing other
   * side-effects such as logging or performance monitoring.
   */
  do(observer: Observer<T>): RelayObservable<T> {
    return new RelayObservable(sink => {
      const both = action =>
        function() {
          try {
            observer[action] && observer[action].apply(observer, arguments);
          } catch (error) {
            handleError(error);
          }
          sink[action] && sink[action].apply(sink, arguments);
        };
      return this.subscribe({
        start: both('start'),
        next: both('next'),
        error: both('error'),
        complete: both('complete'),
        unsubscribe: both('unsubscribe'),
      });
    });
  }

  /**
   * Returns a new Observable which is identical to this one, unless this
   * Observable completes before yielding any values, in which case the new
   * Observable will yield the values from the alternate Observable.
   *
   * If this Observable does yield values, the alternate is never subscribed to.
   *
   * This is useful for scenarios where values may come from multiple sources
   * which should be tried in order, i.e. from a cache before a network.
   */
  ifEmpty<U>(alternate: RelayObservable<U>): RelayObservable<T | U> {
    return new RelayObservable(sink => {
      let hasValue = false;
      let current = this.subscribe({
        next(value) {
          hasValue = true;
          sink.next(value);
        },
        error: sink.error,
        complete() {
          if (hasValue) {
            sink.complete();
          } else {
            current = alternate.subscribe(sink);
          }
        },
      });
      return () => {
        current.unsubscribe();
      };
    });
  }

  /**
   * Observable's primary API: returns an unsubscribable Subscription to the
   * source of this Observable.
   */
  subscribe(observer: Observer<T>): Subscription {
    if (__DEV__) {
      // Early runtime errors for ill-formed observers.
      if (!observer || typeof observer !== 'object') {
        throw new Error(
          'Observer must be an Object with callbacks: ' + String(observer),
        );
      }
    }
    return subscribe(this._source, observer);
  }

  /**
   * Supports subscription of a legacy Relay Observer, returning a Disposable.
   */
  subscribeLegacy(legacyObserver: LegacyObserver<T>): Disposable {
    const subscription = this.subscribe({
      next: legacyObserver.onNext,
      error: legacyObserver.onError,
      complete: legacyObserver.onCompleted,
    });
    return {
      dispose: subscription.unsubscribe,
    };
  }

  /**
   * Returns a new Observerable where each value has been transformed by
   * the mapping function.
   */
  map<U>(fn: T => U): RelayObservable<U> {
    return this.concatMap(value => fromValue(fn(value)));
  }

  /**
   * Returns a new Observable where each value is replaced with a new Observable
   * by the mapping function, the results of which returned as a single
   * concattenated Observable.
   */
  concatMap<U>(fn: T => ObservableFromValue<U>): RelayObservable<U> {
    return new RelayObservable(sink => {
      let hasCompleted = false;
      let outer;
      let inner;
      const buffer = [];

      function next(value) {
        if (inner) {
          buffer.push(value);
        } else {
          try {
            RelayObservable.from(fn(value)).subscribe({
              start: sub => {
                inner = sub;
              },
              next: sink.next,
              error: sink.error,
              complete() {
                inner = undefined;
                if (buffer.length !== 0) {
                  next(buffer.shift());
                } else if (hasCompleted) {
                  sink.complete();
                }
              },
            });
          } catch (error) {
            sink.error(error);
          }
        }
      }

      this.subscribe({
        start: sub => {
          outer = sub;
        },
        next,
        error: sink.error,
        complete() {
          hasCompleted = true;
          if (!inner) {
            sink.complete();
          }
        },
      });

      return () => {
        if (inner) {
          inner.unsubscribe();
          inner = undefined;
        }
        outer.unsubscribe();
        buffer.length = 0;
      };
    });
  }

  /**
   * Returns a new Observable which first mirrors this Observable, then when it
   * completes, waits for `pollInterval` milliseconds before re-subscribing to
   * this Observable again, looping in this manner until unsubscribed.
   *
   * The returned Observable never completes.
   */
  poll(pollInterval: number): RelayObservable<T> {
    if (__DEV__) {
      if (typeof pollInterval !== 'number' || pollInterval <= 0) {
        throw new Error(
          'RelayObservable: Expected pollInterval to be positive, got: ' +
            pollInterval,
        );
      }
    }
    return new RelayObservable(sink => {
      let subscription;
      let timeout;
      const poll = () => {
        subscription = this.subscribe({
          next: sink.next,
          error: sink.error,
          complete() {
            timeout = setTimeout(poll, pollInterval);
          },
        });
      };
      poll();
      return () => {
        clearTimeout(timeout);
        subscription.unsubscribe();
      };
    });
  }

  /**
   * Returns a Promise which resolves when this Observable yields a first value
   * or when it completes with no value.
   */
  toPromise(): Promise<T | void> {
    return new Promise((resolve, reject) => {
      let subscription;
      this.subscribe({
        start(sub) {
          subscription = sub;
        },
        next(val) {
          resolve(val);
          subscription.unsubscribe();
        },
        error: reject,
        complete: resolve,
      });
    });
  }
}

// Use declarations to teach Flow how to check isObservable.
declare function isObservable(p: mixed): boolean %checks(p instanceof
  RelayObservable);

// eslint-disable-next-line no-redeclare
function isObservable(obj) {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.subscribe === 'function'
  );
}

function fromObservable<T>(obj: Subscribable<T>): RelayObservable<T> {
  return obj instanceof RelayObservable
    ? obj
    : new RelayObservable(sink => obj.subscribe(sink));
}

function fromPromise<T>(promise: Promise<T>): RelayObservable<T> {
  return new RelayObservable(sink => {
    // Since sink methods do not throw, the resulting Promise can be ignored.
    promise.then(value => {
      sink.next(value);
      sink.complete();
    }, sink.error);
  });
}

function fromValue<T>(value: T): RelayObservable<T> {
  return new RelayObservable(sink => {
    sink.next(value);
    sink.complete();
  });
}

function fromError(error: Error): RelayObservable<any> {
  return new RelayObservable(sink => {
    sink.error(error);
  });
}

function handleError(error: Error): void {
  hostReportError && hostReportError(error);
}

function subscribe<T>(source: Source<T>, observer: Observer<T>): Subscription {
  let closed = false;
  let cleanup;

  function doCleanup() {
    if (cleanup) {
      if (cleanup.unsubscribe) {
        cleanup.unsubscribe();
      } else {
        try {
          cleanup();
        } catch (error) {
          handleError(error);
        }
      }
      cleanup = undefined;
    }
  }

  // Create a Subscription.
  const subscription: Subscription = {
    unsubscribe() {
      if (!closed) {
        closed = true;

        // Tell Observer that unsubscribe was called.
        try {
          observer.unsubscribe && observer.unsubscribe(subscription);
        } catch (error) {
          handleError(error);
        } finally {
          doCleanup();
        }
      }
    },
  };

  // Tell Observer that observation is about to begin.
  try {
    observer.start && observer.start(subscription);
  } catch (error) {
    handleError(error);
  }

  // If closed already, don't bother creating a Sink.
  if (closed) {
    return subscription;
  }

  // Create a Sink respecting subscription state and cleanup.
  const sink: Sink<T> = {
    next(value) {
      if (!closed && observer.next) {
        try {
          observer.next(value);
        } catch (error) {
          handleError(error);
        }
      }
    },
    error(error) {
      try {
        if (closed) {
          throw error;
        }
        closed = true;
        if (!observer.error) {
          throw error;
        }
        observer.error(error);
      } catch (error2) {
        handleError(error2);
      } finally {
        doCleanup();
      }
    },
    complete() {
      if (!closed) {
        closed = true;
        try {
          observer.complete && observer.complete();
        } catch (error) {
          handleError(error);
        } finally {
          doCleanup();
        }
      }
    },
  };

  // If anything goes wrong during observing the source, handle the error.
  try {
    cleanup = source(sink);
  } catch (error) {
    sink.error(error);
  }

  if (__DEV__) {
    // Early runtime errors for ill-formed returned cleanup.
    if (
      cleanup !== undefined &&
      typeof cleanup !== 'function' &&
      (!cleanup || typeof cleanup.unsubscribe !== 'function')
    ) {
      throw new Error(
        'Returned cleanup function which cannot be called: ' + String(cleanup),
      );
    }
  }

  // If closed before the source function existed, cleanup now.
  if (closed) {
    doCleanup();
  }

  return subscription;
}

if (__DEV__) {
  // Default implementation of HostReportErrors() in development builds.
  // Can be replaced by the host application environment.
  RelayObservable.onUnhandledError(error => {
    declare function fail(string): void;
    if (typeof fail === 'function') {
      // In test environments (Jest), fail() immediately fails the current test.
      fail(String(error));
    } else {
      // Otherwise, rethrow on the next frame to avoid breaking current logic.
      setTimeout(() => {
        throw error;
      });
    }
  });
}

module.exports = RelayObservable;
