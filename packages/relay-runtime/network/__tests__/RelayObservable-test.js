/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall relay
 */

'use strict';

const RelayObservable = require('../RelayObservable');

jest.useFakeTimers({legacyFakeTimers: true});

describe('RelayObservable', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('Fails if not provided a source', () => {
    expect(() => RelayObservable.create()).toThrow('Source must be a Function');
  });

  test('Fails if provided an incorrect source', () => {
    expect(() => RelayObservable.create({})).toThrow(
      'Source must be a Function',
    );
  });

  describe('subscribe', () => {
    test('Fails if not provided with object', () => {
      const obs = RelayObservable.create(() => {});
      expect(() => obs.subscribe()).toThrow(
        'Observer must be an Object with callbacks',
      );
      expect(() => obs.subscribe(() => {})).toThrow(
        'Observer must be an Object with callbacks',
      );
    });

    test('Handle values and complete', () => {
      const list = [];

      RelayObservable.create(sink => {
        sink.next(1);
        sink.next(2);
        sink.next(3);
        sink.complete();
      }).subscribe({
        next: val => list.push('next:' + val),
        error: err => list.push(err),
        complete: () => list.push('complete'),
      });

      expect(list).toEqual(['next:1', 'next:2', 'next:3', 'complete']);
    });

    test('Does not handle values after complete', () => {
      const list = [];

      RelayObservable.create(sink => {
        sink.next(1);
        sink.next(2);
        sink.complete();
        sink.next(3);
      }).subscribe({
        next: val => list.push('next:' + val),
        error: err => list.push(err),
        complete: () => list.push('complete'),
      });

      expect(list).toEqual(['next:1', 'next:2', 'complete']);
    });

    test('Does not handle values after handling error', () => {
      const list = [];
      const error = new Error();

      RelayObservable.create(sink => {
        sink.next(1);
        sink.next(2);
        sink.error(error);
        sink.next(3);
      }).subscribe({
        next: val => list.push('next:' + val),
        error: err => list.push(err),
        complete: () => list.push('complete'),
      });

      expect(list).toEqual(['next:1', 'next:2', error]);
    });

    test('Error after complete is unhandled', () => {
      let sink;
      const list = [];
      const error = new Error();

      const unhandled = jest.fn();
      RelayObservable.onUnhandledError(unhandled);

      RelayObservable.create(_sink => {
        sink = _sink;
      }).subscribe({
        next: val => list.push('next:' + val),
        error: err => list.push(err),
        complete: () => list.push('complete'),
      });

      sink.next(1);
      sink.next(2);
      sink.complete();

      expect(unhandled.mock.calls).toEqual([]);
      sink.error(error);
      expect(unhandled.mock.calls).toEqual([[error, false]]);

      expect(list).toEqual(['next:1', 'next:2', 'complete']);
    });

    test('Error is unhandled if error callback is missing', () => {
      const error = new Error('Test error');

      const unhandled = jest.fn();
      RelayObservable.onUnhandledError(unhandled);

      const obs = RelayObservable.create(sink => {
        sink.error(error);
      });

      obs.subscribe({});
      expect(unhandled.mock.calls).toEqual([[error, false]]);
    });

    test('Calls error handle if source throws', () => {
      const list = [];
      const error = new Error();

      RelayObservable.create(sink => {
        sink.next(1);
        throw error;
      }).subscribe({
        next: val => list.push('next:' + val),
        error: err => list.push(err),
        complete: () => list.push('complete'),
      });

      expect(list).toEqual(['next:1', error]);
    });

    test('Error from next handler is unhandled (sync)', () => {
      const list = [];
      const error = new Error();

      const unhandled = jest.fn();
      RelayObservable.onUnhandledError(unhandled);

      RelayObservable.create(sink => {
        sink.next(1);
        sink.next(2);
        sink.complete();
      }).subscribe({
        next: val => {
          list.push('next:' + val);
          throw error;
        },
        error: err => list.push(err),
        complete: () => list.push('complete'),
      });

      expect(list).toEqual(['next:1', 'next:2', 'complete']);
      expect(unhandled.mock.calls).toEqual([
        [error, true],
        [error, true],
      ]);
    });

    test('Error from next handler is unhandled (async)', () => {
      let sink;
      const list = [];
      const error = new Error();

      const unhandled = jest.fn();
      RelayObservable.onUnhandledError(unhandled);

      RelayObservable.create(_sink => {
        sink = _sink;
      }).subscribe({
        next: val => {
          list.push('next:' + val);
          throw error;
        },
        error: err => list.push(err),
        complete: () => list.push('complete'),
      });

      sink.next(1);

      expect(list).toEqual(['next:1']);
      expect(unhandled.mock.calls).toEqual([[error, true]]);

      sink.next(2);
      sink.complete();

      expect(list).toEqual(['next:1', 'next:2', 'complete']);
      expect(unhandled.mock.calls).toEqual([
        [error, true],
        [error, true],
      ]);
    });

    test('Error from error handler is unhandled', () => {
      const list = [];
      const error = new Error();

      const unhandled = jest.fn();
      RelayObservable.onUnhandledError(unhandled);

      RelayObservable.create(sink => {
        sink.error(error);
      }).subscribe({
        next: val => list.push('next:' + val),
        error: err => {
          list.push(err);
          throw err;
        },
        complete: () => list.push('complete'),
      });

      expect(list).toEqual([error]);
      expect(unhandled.mock.calls).toEqual([[error, true]]);
    });

    test('Error from complete handler is unhandled', () => {
      const list = [];
      const error = new Error();

      const unhandled = jest.fn();
      RelayObservable.onUnhandledError(unhandled);

      RelayObservable.create(sink => {
        sink.complete();
      }).subscribe({
        next: val => list.push('next:' + val),
        error: err => list.push(err),
        complete: () => {
          list.push('complete');
          throw error;
        },
      });

      expect(list).toEqual(['complete']);
      expect(unhandled.mock.calls).toEqual([[error, true]]);
    });

    test('Error from unsubscribe handler is unhandled', () => {
      const list = [];
      const error = new Error();

      const unhandled = jest.fn();
      RelayObservable.onUnhandledError(unhandled);

      const sub = RelayObservable.create(sink => {}).subscribe({
        next: val => list.push('next:' + val),
        error: err => list.push(err),
        complete: () => list.push('complete'),
        unsubscribe: () => {
          list.push('unsubscribe');
          throw error;
        },
      });

      sub.unsubscribe();

      expect(list).toEqual(['unsubscribe']);
      expect(unhandled.mock.calls).toEqual([[error, true]]);
    });
  });

  describe('unsubscribe', () => {
    test('Does not handle values after unsubscribe', () => {
      let sink;
      const list = [];

      const obs = RelayObservable.create(_sink => {
        sink = _sink;
      });

      const sub = obs.subscribe({
        next: val => list.push('next:' + val),
        error: err => list.push(err),
        complete: () => list.push('complete'),
      });

      sink.next(1);
      sub.unsubscribe();
      sink.next(2);

      expect(list).toEqual(['next:1']);
    });

    test('Does not handle complete after unsubscribe', () => {
      let sink;
      const list = [];

      const obs = RelayObservable.create(_sink => {
        sink = _sink;
      });

      const sub = obs.subscribe({
        next: val => list.push('next:' + val),
        error: err => list.push(err),
        complete: () => list.push('complete'),
        unsubscribe: () => list.push('unsubscribe'),
      });

      sink.next(1);
      sub.unsubscribe();
      sink.complete();

      expect(list).toEqual(['next:1', 'unsubscribe']);
    });

    test('Errors after unsubscribe are unhandled', () => {
      let sink;
      const list = [];
      const error = new Error();

      const unhandled = jest.fn();
      RelayObservable.onUnhandledError(unhandled);

      const obs = RelayObservable.create(_sink => {
        sink = _sink;
      });

      const sub = obs.subscribe({
        next: val => list.push('next:' + val),
        error: err => list.push(err),
        complete: () => list.push('complete'),
      });

      sink.next(1);
      sub.unsubscribe();

      expect(unhandled.mock.calls).toEqual([]);
      sink.error(error);
      expect(unhandled.mock.calls).toEqual([[error, false]]);

      expect(list).toEqual(['next:1']);
    });

    test('calls observer with subscription', () => {
      const list = [];
      let unsubSub;
      let unsubThis;

      const obs = RelayObservable.create(sink => {
        list.push('called source');
        return () => list.push('cleanup');
      });

      const observer = {
        start: () => list.push('start'),
        next: val => list.push('next:' + val),
        error: err => list.push(err),
        complete: () => list.push('complete'),
        unsubscribe(subscription) {
          list.push('unsubscribe');
          unsubSub = subscription;
          // eslint-disable-next-line consistent-this
          unsubThis = this;
        },
      };

      const sub = obs.subscribe(observer);
      sub.unsubscribe();

      expect(unsubSub).toBe(sub);
      expect(unsubThis).toBe(observer);

      expect(list).toEqual([
        'start',
        'called source',
        'unsubscribe',
        'cleanup',
      ]);
    });
  });

  describe('cleanup', () => {
    test('Does not allow returning non-callable cleanup', () => {
      const nonCallables = [null, {}, 123, 'wat'];
      nonCallables.forEach(nonCallable => {
        const list = [];

        const obs = RelayObservable.create(sink => {
          return nonCallable;
        });

        expect(() =>
          obs.subscribe({
            error: err => list.push(err),
          }),
        ).toThrow('Returned cleanup function which cannot be called');

        expect(list).toEqual([]);
      });
    });

    test('Calls cleanup after instant complete', () => {
      const list = [];

      RelayObservable.create(sink => {
        sink.next(1);
        sink.complete(1);
        return () => list.push('cleanup');
      }).subscribe({
        next: val => list.push('next:' + val),
        error: err => list.push(err),
        complete: () => list.push('complete'),
      });

      expect(list).toEqual(['next:1', 'complete', 'cleanup']);
    });

    test('Calls cleanup after instant error', () => {
      const list = [];
      const error = new Error();

      RelayObservable.create(sink => {
        sink.next(1);
        sink.error(error);
        return () => list.push('cleanup');
      }).subscribe({
        next: val => list.push('next:' + val),
        error: err => list.push(err),
        complete: () => list.push('complete'),
      });

      expect(list).toEqual(['next:1', error, 'cleanup']);
    });

    test('Calls cleanup after async complete', () => {
      let sink;
      const list = [];

      RelayObservable.create(_sink => {
        sink = _sink;
        return () => list.push('cleanup');
      }).subscribe({
        next: val => list.push('next:' + val),
        error: err => list.push(err),
        complete: () => list.push('complete'),
      });

      sink.next(1);
      sink.complete(1);

      expect(list).toEqual(['next:1', 'complete', 'cleanup']);
    });

    test('Calls cleanup after async error', () => {
      let sink;
      const list = [];
      const error = new Error();

      RelayObservable.create(_sink => {
        sink = _sink;
        return () => list.push('cleanup');
      }).subscribe({
        next: val => list.push('next:' + val),
        error: err => list.push(err),
        complete: () => list.push('complete'),
      });

      sink.next(1);
      sink.error(error);

      expect(list).toEqual(['next:1', error, 'cleanup']);
    });

    test('Calls cleanup after unsubscribe', () => {
      let sink;
      const list = [];

      const obs = RelayObservable.create(_sink => {
        sink = _sink;
        return () => list.push('cleanup');
      });

      const sub = obs.subscribe({
        next: val => list.push('next:' + val),
        error: err => list.push(err),
        complete: () => list.push('complete'),
        unsubscribe: () => list.push('unsubscribe'),
      });

      sink.next(1);
      sub.unsubscribe();

      expect(list).toEqual(['next:1', 'unsubscribe', 'cleanup']);
    });

    test('Does not cleanup twice after double unsubscribe', () => {
      let sink;
      const list = [];

      const obs = RelayObservable.create(_sink => {
        sink = _sink;
        return () => list.push('cleanup');
      });

      const sub = obs.subscribe({
        next: val => list.push('next:' + val),
        error: err => list.push(err),
        complete: () => list.push('complete'),
        unsubscribe: () => list.push('unsubscribe'),
      });

      sink.next(1);
      sub.unsubscribe();
      sub.unsubscribe();

      expect(list).toEqual(['next:1', 'unsubscribe', 'cleanup']);
    });

    test('Calls cleanup after error handler throws', () => {
      let sink;
      const list = [];
      const error = new Error();

      const unhandled = jest.fn();
      RelayObservable.onUnhandledError(unhandled);

      RelayObservable.create(_sink => {
        sink = _sink;
        return () => list.push('cleanup');
      }).subscribe({
        next: val => list.push('next:' + val),
        error: err => {
          list.push(err);
          throw err;
        },
        complete: () => list.push('complete'),
        unsubscribe: () => list.push('unsubscribe'),
      });

      sink.next(1);
      sink.error(error);

      expect(list).toEqual(['next:1', error, 'cleanup']);
      expect(unhandled.mock.calls).toEqual([[error, true]]);
    });

    test('Calls cleanup after complete handler throws', () => {
      let sink;
      const list = [];
      const error = new Error();

      const unhandled = jest.fn();
      RelayObservable.onUnhandledError(unhandled);

      RelayObservable.create(_sink => {
        sink = _sink;
        return () => list.push('cleanup');
      }).subscribe({
        next: val => list.push('next:' + val),
        error: err => list.push(err),
        complete: () => {
          list.push('complete');
          throw error;
        },
        unsubscribe: () => list.push('unsubscribe'),
      });

      sink.next(1);
      sink.complete();

      expect(list).toEqual(['next:1', 'complete', 'cleanup']);
      expect(unhandled.mock.calls).toEqual([[error, true]]);
    });

    test('Does not cleanup after next handler throws', () => {
      let sink;
      const list = [];
      const error = new Error();

      const unhandled = jest.fn();
      RelayObservable.onUnhandledError(unhandled);

      RelayObservable.create(_sink => {
        sink = _sink;
        return () => list.push('cleanup');
      }).subscribe({
        next: val => {
          list.push('next:' + val);
          throw error;
        },
        error: err => list.push(err),
        complete: () => list.push('complete'),
      });

      sink.next(1);

      expect(list).toEqual(['next:1']);
      expect(unhandled.mock.calls).toEqual([[error, true]]);

      sink.next(2);

      expect(list).toEqual(['next:1', 'next:2']);
      expect(unhandled.mock.calls).toEqual([
        [error, true],
        [error, true],
      ]);
    });

    test('Allows returning a Subscription as cleanup', () => {
      let sink;
      const list = [];

      const obs1 = RelayObservable.create(() => {
        return () => list.push('inner-cleanup');
      });

      const obs2 = RelayObservable.create(_sink => {
        sink = _sink;
        return obs1.subscribe({});
      });

      const sub = obs2.subscribe({
        next: val => list.push('next:' + val),
        error: err => list.push(err),
        complete: () => list.push('complete'),
      });

      sink.next(1);
      sub.unsubscribe();

      expect(list).toEqual(['next:1', 'inner-cleanup']);
    });

    test('Cleanup errors are unhandled', () => {
      let sink;
      const list = [];
      const error = new Error();

      const unhandled = jest.fn();
      RelayObservable.onUnhandledError(unhandled);

      RelayObservable.create(_sink => {
        sink = _sink;
        return () => {
          list.push('cleanup');
          throw error;
        };
      }).subscribe({
        next: val => list.push('next:' + val),
        error: err => list.push(err),
        complete: () => list.push('complete'),
      });

      sink.next(1);
      sink.complete();

      expect(list).toEqual(['next:1', 'complete', 'cleanup']);
      expect(unhandled.mock.calls).toEqual([[error, true]]);
    });
  });

  describe('start', () => {
    test('Is called before source', () => {
      const list = [];
      let startSub;
      let startThis;

      const obs = RelayObservable.create(sink => {
        list.push('enter source');
        sink.next(1);
        sink.complete();
        list.push('exit source');
      });

      const observer = {
        start(subscription) {
          list.push('start');
          startSub = subscription;
          // eslint-disable-next-line consistent-this
          startThis = this;
        },
        next: val => list.push('next:' + val),
        error: err => list.push(err),
        complete: () => list.push('complete'),
      };

      const sub = obs.subscribe(observer);

      expect(startSub).toBe(sub);
      expect(startThis).toBe(observer);

      expect(list).toEqual([
        'start',
        'enter source',
        'next:1',
        'complete',
        'exit source',
      ]);
    });

    test('Can unsubscribe before source', () => {
      const list = [];

      RelayObservable.create(sink => {
        list.push('enter source');
        sink.next(1);
        sink.complete();
        list.push('exit source');
      }).subscribe({
        start: subscription => {
          list.push('start');
          subscription.unsubscribe();
        },
        next: val => list.push('next:' + val),
        error: err => list.push(err),
        complete: () => list.push('complete'),
        unsubscribe: () => list.push('unsubscribe'),
      });

      expect(list).toEqual(['start', 'unsubscribe']);
    });

    test('Error from start handler is unhandled', () => {
      let sink;
      const list = [];
      const error = new Error();

      const unhandled = jest.fn();
      RelayObservable.onUnhandledError(unhandled);

      RelayObservable.create(_sink => {
        sink = _sink;
        return () => list.push('cleanup');
      }).subscribe({
        start: () => {
          list.push('start');
          throw error;
        },
        next: val => list.push('next:' + val),
        error: err => list.push(err),
        complete: () => list.push('complete'),
      });

      expect(unhandled.mock.calls).toEqual([[error, true]]);

      sink.complete();
      expect(list).toEqual(['start', 'complete', 'cleanup']);
    });
  });

  describe('sink.closed', () => {
    test('initializes to false', () => {
      let sink;

      const obs = RelayObservable.create(_sink => {
        sink = _sink;
      });

      obs.subscribe({});
      expect(sink.closed).toBe(false);
    });

    test('is true after complete', () => {
      let sink;

      const obs = RelayObservable.create(_sink => {
        sink = _sink;
      });

      obs.subscribe({});

      expect(sink.closed).toBe(false);
      sink.complete();
      expect(sink.closed).toBe(true);
    });

    test('is true after error', () => {
      let sink;

      const obs = RelayObservable.create(_sink => {
        sink = _sink;
      });

      obs.subscribe({error: () => {}});

      expect(sink.closed).toBe(false);
      sink.error(new Error());
      expect(sink.closed).toBe(true);
    });

    test('is true after unsubscribe', () => {
      let sink;

      const obs = RelayObservable.create(_sink => {
        sink = _sink;
      });

      const sub = obs.subscribe({});

      expect(sink.closed).toBe(false);
      sub.unsubscribe();
      expect(sink.closed).toBe(true);
    });

    test('is true within cleanup', () => {
      let wasClosed;

      const obs = RelayObservable.create(sink => {
        return () => {
          wasClosed = sink.closed;
        };
      });

      obs.subscribe({}).unsubscribe();

      expect(wasClosed).toBe(true);
    });

    test('cannot be set directly', () => {
      let sink;

      const obs = RelayObservable.create(_sink => {
        sink = _sink;
      });

      obs.subscribe({});

      expect(() => {
        sink.closed = true;
      }).toThrow(TypeError);
    });
  });

  describe('subscription.closed', () => {
    test('initializes to false', () => {
      const obs = RelayObservable.create(() => {});

      const sub = obs.subscribe({
        start: subscription => {
          expect(subscription.closed).toBe(false);
        },
      });

      expect(sub.closed).toBe(false);
    });

    test('is true after complete', () => {
      let sink;

      const obs = RelayObservable.create(_sink => {
        sink = _sink;
      });

      const sub = obs.subscribe({
        complete: () => {
          expect(sub.closed).toBe(true);
        },
      });

      expect(sub.closed).toBe(false);
      sink.complete();
      expect(sub.closed).toBe(true);
    });

    test('is true after error', () => {
      let sink;

      const obs = RelayObservable.create(_sink => {
        sink = _sink;
      });

      const sub = obs.subscribe({
        error: () => {
          expect(sub.closed).toBe(true);
        },
      });

      expect(sub.closed).toBe(false);
      sink.error(new Error());
      expect(sub.closed).toBe(true);
    });

    test('is true after unsubscribe', () => {
      const obs = RelayObservable.create(() => {});

      const sub = obs.subscribe({
        unsubscribe: subscription => {
          expect(subscription.closed).toBe(true);
        },
      });

      expect(sub.closed).toBe(false);
      sub.unsubscribe();
      expect(sub.closed).toBe(true);
    });

    test('cannot be set directly', () => {
      const obs = RelayObservable.create(() => {});
      const sub = obs.subscribe({});
      expect(() => {
        sub.closed = true;
      }).toThrow(TypeError);
    });
  });

  describe('map', () => {
    test('Maps values from the original observable', () => {
      const source = RelayObservable.create(sink => {
        sink.next(1);
        sink.next(2);
        sink.next(3);
        sink.complete();
      });

      const mapped = source.map(v => v * 2 + 1);

      const list = [];
      mapped.subscribe({
        next: val => list.push('next:' + val),
        error: err => list.push(err),
        complete: () => list.push('complete'),
      });

      expect(list).toEqual(['next:3', 'next:5', 'next:7', 'complete']);
    });

    test('Does not coerce mapped value', () => {
      const source = RelayObservable.create(sink => {
        sink.next(1);
        sink.next(2);
        sink.next(3);
        sink.complete();
      });

      const other = RelayObservable.from(10);

      const mapped = source.map(v => other);

      const list = [];
      mapped.subscribe({
        next: val => list.push(val),
        error: err => list.push(err),
        complete: () => list.push('complete'),
      });

      expect(list).toEqual([other, other, other, 'complete']);
    });

    test('Does not map errors from the original observable', () => {
      const list = [];
      const error = new Error();

      const source = RelayObservable.create(sink => {
        sink.next(1);
        sink.next(2);
        sink.error(error);
        sink.next(3);
      });

      const mapped = source.map(v => v * 2 + 1);

      mapped.subscribe({
        next: val => list.push('next:' + val),
        error: err => list.push(err),
        complete: () => list.push('complete'),
      });

      expect(list).toEqual(['next:3', 'next:5', error]);
    });

    test('Calls error handler and cleans up if map function throws', () => {
      const list = [];
      const error = new Error();

      const source = RelayObservable.create(sink => {
        sink.next(1);
        sink.next(2);
        sink.next(3);
        return () => list.push('cleanup');
      });

      const mapped = source.map(v => {
        if (v === 2) {
          throw error;
        }
        return v * 2 + 1;
      });

      mapped.subscribe({
        next: val => list.push('next:' + val),
        error: err => list.push(err),
        complete: () => list.push('complete'),
      });

      expect(list).toEqual(['next:3', error, 'cleanup']);
    });

    test('Error thrown from mapper and no error handler is unhandled', () => {
      let sink;
      const list = [];
      const error = new Error();

      const unhandled = jest.fn();
      RelayObservable.onUnhandledError(unhandled);

      const source = RelayObservable.create(_sink => {
        sink = _sink;
        return () => list.push('cleanup');
      });

      const mapped = source.map(v => {
        if (v === 2) {
          throw error;
        }
        return v * 2 + 1;
      });

      mapped.subscribe({
        next: val => list.push('next:' + val),
      });

      sink.next(1);
      expect(unhandled.mock.calls).toEqual([]);

      sink.next(2);
      expect(unhandled.mock.calls).toEqual([[error, true]]);

      expect(list).toEqual(['next:3', 'cleanup']);
    });

    test('Does not call error handler if next handler throws', () => {
      let sink;
      const list = [];
      const error = new Error();

      const unhandled = jest.fn();
      RelayObservable.onUnhandledError(unhandled);

      const source = RelayObservable.create(_sink => {
        sink = _sink;
        return () => list.push('cleanup');
      });

      const mapped = source.map(v => v * 2 + 1);

      mapped.subscribe({
        next: val => {
          list.push('next:' + val);
          if (val === 5) {
            throw error;
          }
        },
        error: err => list.push(err),
      });

      sink.next(1);
      expect(unhandled.mock.calls).toEqual([]);

      sink.next(2);
      expect(unhandled.mock.calls).toEqual([[error, true]]);

      sink.next(3);
      expect(list).toEqual(['next:3', 'next:5', 'next:7']);
    });
  });

  describe('mergeMap', () => {
    test('Maps values from the original observable', () => {
      const source = RelayObservable.create(sink => {
        sink.next(1);
        sink.next(2);
        sink.next(3);
        sink.complete();
      });

      const mapped = source.mergeMap(v =>
        RelayObservable.create(sink => {
          sink.next(v * 2 + 1);
          sink.next(v * 10 + 1);
          sink.complete();
        }),
      );

      const list = [];
      mapped.subscribe({
        next: val => list.push('next:' + val),
        error: err => list.push(err),
        complete: () => list.push('complete'),
      });

      expect(list).toEqual([
        'next:3',
        'next:11',
        'next:5',
        'next:21',
        'next:7',
        'next:31',
        'complete',
      ]);
    });

    test('Maps to Promises which are converted to Observable', async () => {
      const source = RelayObservable.create(sink => {
        sink.next(1);
        sink.next(2);
        sink.next(3);
        sink.complete();
      });

      const promises = [];

      const mapped = source.mergeMap(v => {
        const promise = Promise.resolve(v * 2 + 1);
        promises.push(promise);
        return promise;
      });

      const list = [];
      mapped.subscribe({
        next: val => list.push('next:' + val),
        error: err => list.push(err),
        complete: () => list.push('complete'),
      });

      while (promises.length) {
        await promises.shift();
      }

      expect(list).toEqual(['next:3', 'next:5', 'next:7', 'complete']);
    });

    test('Merges values from all mapped Observables at once', () => {
      let outerSink;
      const innerSinks = [];
      const list = [];

      const source = RelayObservable.create(sink => {
        outerSink = sink;
        return () => list.push('cleanup outer');
      });

      const mapped = source.mergeMap(v => {
        list.push('mergeMap:' + v);
        return RelayObservable.create(sink => {
          innerSinks.push(sink);
          return () => list.push('cleanup inner:' + v);
        });
      });

      mapped.subscribe({
        next: val => list.push('next:' + val),
        error: err => list.push(err),
        complete: () => list.push('complete'),
      });

      // Many created publishes
      outerSink.next(1);
      outerSink.next(2);
      innerSinks[0].next(10);
      outerSink.next(3);
      innerSinks[2].next(30);
      outerSink.complete();
      innerSinks[1].next(20);
      innerSinks[2].complete();
      innerSinks[0].next(11);
      innerSinks[0].complete();
      innerSinks[1].next(21);
      innerSinks[1].complete();

      expect(list).toEqual([
        'mergeMap:1',
        'mergeMap:2',
        'next:10',
        'mergeMap:3',
        'next:30',
        'cleanup outer',
        'next:20',
        'cleanup inner:3',
        'next:11',
        'cleanup inner:1',
        'next:21',
        'complete',
        'cleanup inner:2',
      ]);
    });

    test('Does not map errors from the original observable', () => {
      const list = [];
      const error = new Error();

      const source = RelayObservable.create(sink => {
        sink.next(1);
        sink.next(2);
        sink.error(error);
        sink.next(3);
      });

      const mapped = source.mergeMap(v =>
        RelayObservable.create(sink => {
          sink.next(v * 2 + 1);
          sink.next(v * 10 + 1);
          sink.complete();
        }),
      );

      mapped.subscribe({
        next: val => list.push('next:' + val),
        error: err => list.push(err),
        complete: () => list.push('complete'),
      });

      expect(list).toEqual(['next:3', 'next:11', 'next:5', 'next:21', error]);
    });

    test('Calls error handler and cleans up if map function throws', () => {
      const list = [];
      const error = new Error();

      const source = RelayObservable.create(sink => {
        sink.next(1);
        sink.next(2);
        sink.next(3);
        return () => list.push('cleanup');
      });

      const mapped = source.mergeMap(v => {
        if (v === 2) {
          throw error;
        }
        return RelayObservable.create(sink => {
          sink.next(v * 2 + 1);
          sink.next(v * 10 + 1);
          sink.complete();
        });
      });

      mapped.subscribe({
        next: val => list.push('next:' + val),
        error: err => list.push(err),
        complete: () => list.push('complete'),
      });

      expect(list).toEqual(['next:3', 'next:11', error, 'cleanup']);
    });

    test('Calls error handler and cleans up if mapped Observable errors', () => {
      const list = [];
      const error = new Error();

      const source = RelayObservable.create(sink => {
        sink.next(1);
        sink.next(2);
        sink.next(3);
        return () => list.push('cleanup');
      });

      const mapped = source.mergeMap(v =>
        RelayObservable.create(sink => {
          sink.next(v * 2 + 1);
          sink.error(error);
        }),
      );

      mapped.subscribe({
        next: val => list.push('next:' + val),
        error: err => list.push(err),
        complete: () => list.push('complete'),
      });

      expect(list).toEqual(['next:3', error, 'cleanup']);
    });

    test('Unsubscribes from mapped Observable', () => {
      let outerSink;
      const list = [];

      const source = RelayObservable.create(sink => {
        outerSink = sink;
        return () => list.push('cleanup outer');
      });

      const mapped = source.mergeMap(v =>
        RelayObservable.create(sink => {
          return () => list.push('cleanup inner:' + v);
        }),
      );

      const subscription = mapped.subscribe({
        next: val => list.push('next:' + val),
        error: err => list.push(err),
        complete: () => list.push('complete'),
      });

      outerSink.next(1);
      outerSink.next(2);
      outerSink.next(3);
      subscription.unsubscribe();

      expect(list).toEqual([
        'cleanup outer',
        'cleanup inner:1',
        'cleanup inner:2',
        'cleanup inner:3',
      ]);
    });

    test('Error thrown from mapper and no error handler is unhandled', () => {
      let sink;
      const list = [];
      const error = new Error();

      const unhandled = jest.fn();
      RelayObservable.onUnhandledError(unhandled);

      const source = RelayObservable.create(_sink => {
        sink = _sink;
        return () => list.push('cleanup');
      });

      const mapped = source.mergeMap(v => {
        if (v === 2) {
          throw error;
        }
        return RelayObservable.create(_sink => {
          _sink.next(v * 2 + 1);
          _sink.next(v * 10 + 1);
          _sink.complete();
        });
      });

      mapped.subscribe({
        next: val => list.push('next:' + val),
      });

      sink.next(1);
      expect(unhandled.mock.calls).toEqual([]);

      sink.next(2);
      expect(unhandled.mock.calls).toEqual([[error, true]]);

      expect(list).toEqual(['next:3', 'next:11', 'cleanup']);
    });

    test('Does not call error handler if next handler throws', () => {
      let sink;
      const list = [];
      const error = new Error();

      const unhandled = jest.fn();
      RelayObservable.onUnhandledError(unhandled);

      const source = RelayObservable.create(_sink => {
        sink = _sink;
        return () => list.push('cleanup');
      });

      const mapped = source.mergeMap(v =>
        RelayObservable.create(_sink => {
          _sink.next(v * 2 + 1);
          _sink.next(v * 10 + 1);
          _sink.complete();
        }),
      );

      mapped.subscribe({
        next: val => {
          list.push('next:' + val);
          if (val === 5) {
            throw error;
          }
        },
        error: err => list.push(err),
      });

      sink.next(1);
      expect(unhandled.mock.calls).toEqual([]);

      sink.next(2);
      expect(unhandled.mock.calls).toEqual([[error, true]]);

      sink.next(3);
      expect(list).toEqual([
        'next:3',
        'next:11',
        'next:5',
        'next:21',
        'next:7',
        'next:31',
      ]);
    });
  });

  describe('from', () => {
    test('Converts a resolved Promise to an Observable', async () => {
      const list = [];
      const value = {key: 'value'};

      const promise = Promise.resolve(value);
      const obs = RelayObservable.from(promise);

      obs.subscribe({
        next: val => list.push(val),
        error: err => {
          list.push('error');
          list.push(err);
        },
        complete: () => list.push('complete'),
      });

      // Promise does not resolve callbacks synchronously.
      expect(list).toEqual([]);
      await promise;
      expect(list).toEqual([value, 'complete']);
    });

    test('Converts a rejected Promise to an Observable', async () => {
      const list = [];
      const error = new Error();

      const promise = Promise.reject(error);
      const obs = RelayObservable.from(promise);

      obs.subscribe({
        next: val => list.push(val),
        error: err => {
          list.push('error');
          list.push(err);
        },
        complete: () => list.push('complete'),
      });

      // Promise does not resolve callbacks synchronously.
      expect(list).toEqual([]);
      await promise.catch(() => {});
      expect(list).toEqual(['error', error]);
    });

    test('Error in next handler is unhandled', async () => {
      const list = [];
      const error = new Error();
      const value = {key: 'value'};

      const unhandled = jest.fn();
      RelayObservable.onUnhandledError(unhandled);

      const promise = Promise.resolve(value);
      const obs = RelayObservable.from(promise);

      obs.subscribe({
        next: val => {
          list.push(val);
          throw error;
        },
        error: err => {
          list.push('error');
          list.push(err);
        },
        complete: () => list.push('complete'),
      });

      // Promise does not resolve callbacks synchronously.
      expect(list).toEqual([]);
      await promise;
      expect(list).toEqual([value, 'complete']);

      expect(unhandled.mock.calls).toEqual([[error, true]]);
    });

    test('Directly returns RelayObservable instance', () => {
      const obs1 = RelayObservable.create(() => {});
      const obs2 = RelayObservable.from(obs1);

      expect(obs2).toBe(obs1);
    });

    test('Subscribes to Observable from another library', () => {
      const list = [];

      const fauxObservable = {
        subscribe(callbacks) {
          callbacks.next(1);
          callbacks.next(2);
          callbacks.complete();
          return {
            unsubscribe() {
              list.push('unsubscribed');
            },
          };
        },
      };

      const obs = RelayObservable.from(fauxObservable);

      obs.subscribe({
        next: val => list.push(val),
        error: err => {
          list.push('error');
          list.push(err);
        },
        complete: () => list.push('complete'),
      });

      expect(list).toEqual([1, 2, 'complete', 'unsubscribed']);
    });

    test('Converts a plain value to an Observable', () => {
      const list = [];
      const value = {key: 'value'};

      const obs = RelayObservable.from(value);

      obs.subscribe({
        next: val => list.push(val),
        error: err => {
          list.push('error');
          list.push(err);
        },
        complete: () => list.push('complete'),
      });

      expect(list).toEqual([value, 'complete']);
    });

    test('Does not convert an Error to a rejected Observable', () => {
      const list = [];
      const error = new Error();

      const obs = RelayObservable.from(error);

      obs.subscribe({
        next: val => {
          list.push('next');
          list.push(val);
        },
        error: err => {
          list.push('error');
          list.push(err);
        },
        complete: () => list.push('complete'),
      });

      expect(list).toEqual(['next', error, 'complete']);
    });
  });

  describe('fromPromise', () => {
    test('Cleans up when unsubscribed', () => {
      let resolve;
      const observer = {
        complete: jest.fn(),
        error: jest.fn(),
        next: jest.fn(),
        start: jest.fn(),
        unsubscribe: jest.fn(),
      };
      const x = new Promise(_resolve => (resolve = _resolve));
      const subscription = RelayObservable.from(x).subscribe(observer);
      subscription.unsubscribe();
      resolve();
      jest.runAllTimers();
      expect(observer.complete).toBeCalledTimes(0);
      expect(observer.error).toBeCalledTimes(0);
      expect(observer.next).toBeCalledTimes(0);
      expect(observer.start).toBeCalledTimes(1);
      expect(observer.unsubscribe).toBeCalledTimes(1);
    });

    test('Calls next and complete when the promise resolves', () => {
      const observer = {
        complete: jest.fn(),
        error: jest.fn(),
        next: jest.fn(),
        start: jest.fn(),
        unsubscribe: jest.fn(),
      };
      const value = {};
      RelayObservable.from(Promise.resolve(value)).subscribe(observer);
      jest.runAllTimers();
      expect(observer.complete).toBeCalledTimes(1);
      expect(observer.error).toBeCalledTimes(0);
      expect(observer.next).toBeCalledTimes(1);
      expect(observer.next.mock.calls[0][0]).toBe(value);
      expect(observer.start).toBeCalledTimes(1);
      expect(observer.unsubscribe).toBeCalledTimes(0);
    });

    test('Calls error when the promise rejects', () => {
      const observer = {
        complete: jest.fn(),
        error: jest.fn(),
        next: jest.fn(),
        start: jest.fn(),
        unsubscribe: jest.fn(),
      };
      const error = new Error();
      RelayObservable.from(Promise.reject(error)).subscribe(observer);
      jest.runAllTimers();
      expect(observer.complete).toBeCalledTimes(0);
      expect(observer.error).toBeCalledTimes(1);
      expect(observer.error.mock.calls[0][0]).toBe(error);
      expect(observer.next).toBeCalledTimes(0);
      expect(observer.start).toBeCalledTimes(1);
      expect(observer.unsubscribe).toBeCalledTimes(0);
    });
  });

  describe('poll', () => {
    test('Throws error if polling interval is too small', () => {
      expect(() => RelayObservable.create(() => {}).poll(0)).toThrow(
        'Expected pollInterval to be positive',
      );

      expect(() => RelayObservable.create(() => {}).poll(-1)).toThrow(
        'Expected pollInterval to be positive',
      );

      expect(() => RelayObservable.create(() => {}).poll('3')).toThrow(
        'Expected pollInterval to be positive',
      );

      expect(() => RelayObservable.create(() => {}).poll({})).toThrow(
        'Expected pollInterval to be positive',
      );
    });

    test('Repeatedly observes and subscribes', () => {
      let sink;
      const list = [];
      const obs = RelayObservable.create(_sink => {
        list.push('start');
        sink = _sink;
        return () => list.push('cleanup');
      }).poll(1);

      const sub = obs.subscribe({
        next: val => list.push(val),
        complete: () => list.push('complete'),
      });

      sink.next('one');
      expect(list).toEqual(['start', 'one']);

      sink.complete();
      expect(list).toEqual(['start', 'one', 'cleanup']);

      const sink1 = sink;
      jest.runAllTimers(); // advance to next poll
      expect(sink).not.toBe(sink1);
      expect(list).toEqual(['start', 'one', 'cleanup', 'start']);

      sink.next('again');
      expect(list).toEqual(['start', 'one', 'cleanup', 'start', 'again']);

      jest.runAllTimers(); // does nothing since previous was not completed.
      expect(list).toEqual(['start', 'one', 'cleanup', 'start', 'again']);

      sink.complete();
      expect(list).toEqual([
        'start',
        'one',
        'cleanup',
        'start',
        'again',
        'cleanup',
      ]);

      sub.unsubscribe(); // does not call cleanup twice.
      expect(list).toEqual([
        'start',
        'one',
        'cleanup',
        'start',
        'again',
        'cleanup',
      ]);

      jest.runAllTimers(); // does nothing since unsubscribed.
      expect(list).toEqual([
        'start',
        'one',
        'cleanup',
        'start',
        'again',
        'cleanup',
      ]);
    });

    test('Cleans up after unsubscribe', () => {
      let sink;
      const list = [];
      const obs = RelayObservable.create(_sink => {
        list.push('start');
        sink = _sink;
        return () => list.push('cleanup');
      }).poll(1);

      const sub = obs.subscribe({
        next: val => list.push(val),
        complete: () => list.push('complete'),
      });

      sink.next('one');
      expect(list).toEqual(['start', 'one']);

      sub.unsubscribe(); // does not call cleanup twice.
      expect(list).toEqual(['start', 'one', 'cleanup']);

      jest.runAllTimers(); // does nothing since unsubscribed.
      expect(list).toEqual(['start', 'one', 'cleanup']);
    });
  });

  describe('concat', () => {
    test('Yields values from both observables', () => {
      const list = [];

      const fruits = RelayObservable.create(sink => {
        list.push('begin fruits');
        sink.next('Apple');
        sink.next('Banana');
        sink.complete();
        return () => list.push('cleanup fruits');
      });

      const cities = RelayObservable.create(sink => {
        list.push('begin cities');
        sink.next('Athens');
        sink.next('Berlin');
        sink.complete();
        return () => list.push('cleanup cities');
      });

      const fruitsThenCities = fruits.concat(cities);
      fruitsThenCities.subscribe({
        next: val => list.push(val),
        error: err => {
          list.push('error');
          list.push(err);
        },
        complete: () => list.push('complete'),
      });

      expect(list).toEqual([
        'begin fruits',
        'Apple',
        'Banana',
        'begin cities',
        'Athens',
        'Berlin',
        'complete',
        'cleanup cities',
        'cleanup fruits',
      ]);
    });

    test('Error passes through without starting the second', () => {
      const list = [];
      const error = new Error();

      const problem = RelayObservable.create(sink => {
        list.push('begin problem');
        sink.error(error);
        return () => list.push('cleanup problem');
      });

      const cities = RelayObservable.create(sink => {
        list.push('begin cities');
        sink.next('Athens');
        sink.next('Berlin');
        sink.complete();
        return () => list.push('cleanup cities');
      });

      const problemThenCities = problem.concat(cities);

      problemThenCities.subscribe({
        next: val => list.push(val),
        error: err => {
          list.push('error');
          list.push(err);
        },
        complete: () => list.push('complete'),
      });

      expect(list).toEqual([
        'begin problem',
        'error',
        error,
        'cleanup problem',
      ]);
    });

    test('Does not start second Observable if first is unsubscribed', () => {
      let sink1;
      const list = [];

      const obs1 = RelayObservable.create(sink => {
        list.push('create first');
        sink1 = sink;
        return () => list.push('cleanup first');
      });

      const obs2 = RelayObservable.create(sink => {
        list.push('create second');
        return () => list.push('cleanup second');
      });

      const sub = obs1.concat(obs2).subscribe({
        next: val => list.push('next:' + val),
        error: err => list.push(err),
        complete: () => list.push('complete'),
        unsubscribe: () => list.push('unsubscribe'),
      });

      sink1.next(1);
      sub.unsubscribe();

      expect(list).toEqual([
        'create first',
        'next:1',
        'unsubscribe',
        'cleanup first',
      ]);
    });

    test('Cleans up both Observables if second is unsubscribed', () => {
      let sink1;
      let sink2;
      const list = [];

      const obs1 = RelayObservable.create(sink => {
        list.push('create first');
        sink1 = sink;
        return () => list.push('cleanup first');
      });

      const obs2 = RelayObservable.create(sink => {
        list.push('create second');
        sink2 = sink;
        return () => list.push('cleanup second');
      });

      const sub = obs1.concat(obs2).subscribe({
        next: val => list.push('next:' + val),
        error: err => list.push(err),
        complete: () => list.push('complete'),
        unsubscribe: () => list.push('unsubscribe'),
      });

      sink1.next(1);
      sink1.complete();
      sink2.next(2);
      sub.unsubscribe();

      expect(list).toEqual([
        'create first',
        'next:1',
        'create second',
        'cleanup first',
        'next:2',
        'unsubscribe',
        'cleanup second',
      ]);
    });
  });

  describe('ifEmpty', () => {
    test('Matches the first Observable if values are yielded', () => {
      const list = [];

      const fruits = RelayObservable.create(sink => {
        list.push('begin fruits');
        sink.next('Apple');
        sink.next('Banana');
        sink.complete();
        return () => list.push('cleanup fruits');
      });

      const cities = RelayObservable.create(sink => {
        list.push('begin cities');
        sink.next('Athens');
        sink.next('Berlin');
        sink.complete();
        return () => list.push('cleanup cities');
      });

      const fruitsOrCities = fruits.ifEmpty(cities);

      fruitsOrCities.subscribe({
        next: val => list.push(val),
        error: err => {
          list.push('error');
          list.push(err);
        },
        complete: () => list.push('complete'),
      });

      expect(list).toEqual([
        'begin fruits',
        'Apple',
        'Banana',
        'complete',
        'cleanup fruits',
      ]);
    });

    test('Matches the second Observable if no values are yielded', () => {
      const list = [];

      const empty = RelayObservable.create(sink => {
        list.push('begin empty');
        sink.complete();
        return () => list.push('cleanup empty');
      });

      const cities = RelayObservable.create(sink => {
        list.push('begin cities');
        sink.next('Athens');
        sink.next('Berlin');
        sink.complete();
        return () => list.push('cleanup cities');
      });

      const emptyOrCities = empty.ifEmpty(cities);

      emptyOrCities.subscribe({
        next: val => list.push(val),
        error: err => {
          list.push('error');
          list.push(err);
        },
        complete: () => list.push('complete'),
      });

      expect(list).toEqual([
        'begin empty',
        'begin cities',
        'Athens',
        'Berlin',
        'complete',
        'cleanup cities',
        'cleanup empty',
      ]);
    });

    test('Error passes through without starting the second', () => {
      const list = [];
      const error = new Error();

      const problem = RelayObservable.create(sink => {
        list.push('begin problem');
        sink.error(error);
        return () => list.push('cleanup problem');
      });

      const cities = RelayObservable.create(sink => {
        list.push('begin cities');
        sink.next('Athens');
        sink.next('Berlin');
        sink.complete();
        return () => list.push('cleanup cities');
      });

      const problemOrCities = problem.ifEmpty(cities);

      problemOrCities.subscribe({
        next: val => list.push(val),
        error: err => {
          list.push('error');
          list.push(err);
        },
        complete: () => list.push('complete'),
      });

      expect(list).toEqual([
        'begin problem',
        'error',
        error,
        'cleanup problem',
      ]);
    });
  });

  describe('do', () => {
    test('Performs side effects before subscribers', () => {
      const list = [];

      const cities = RelayObservable.create(sink => {
        list.push('begin cities');
        sink.next('Athens');
        sink.next('Berlin');
        sink.complete();
        return () => list.push('cleanup cities');
      });

      const citiesWithSideEffects = cities.do({
        start(sub) {
          list.push('do: started');
        },
        next(value) {
          list.push('do: value');
          list.push(value);
        },
        error(err) {
          list.push('do: error');
          list.push(err);
        },
        complete() {
          list.push('do: complete');
        },
      });

      citiesWithSideEffects.subscribe({
        start() {
          list.push('subscriber: started');
        },
        next(value) {
          list.push('subscriber: value');
          list.push(value);
        },
        error(err) {
          list.push('subscriber: error');
          list.push(err);
        },
        complete() {
          list.push('subscriber: complete');
        },
      });

      expect(list).toEqual([
        'subscriber: started',
        'do: started',
        'begin cities',
        'do: value',
        'Athens',
        'subscriber: value',
        'Athens',
        'do: value',
        'Berlin',
        'subscriber: value',
        'Berlin',
        'do: complete',
        'subscriber: complete',
        'cleanup cities',
      ]);
    });

    test('Performs side effects on errors', () => {
      const list = [];
      const error = new Error();

      const cities = RelayObservable.create(sink => {
        list.push('begin cities');
        sink.error(error);
        return () => list.push('cleanup cities');
      });

      const citiesWithSideEffects = cities.do({
        start() {
          list.push('do: started');
        },
        next(value) {
          list.push('do: value');
          list.push(value);
        },
        error(err) {
          list.push('do: error');
          list.push(err);
        },
        complete() {
          list.push('do: complete');
        },
      });

      citiesWithSideEffects.subscribe({
        start() {
          list.push('subscriber: started');
        },
        next(value) {
          list.push('subscriber: value');
          list.push(value);
        },
        error(err) {
          list.push('subscriber: error');
          list.push(err);
        },
        complete() {
          list.push('subscriber: complete');
        },
      });

      expect(list).toEqual([
        'subscriber: started',
        'do: started',
        'begin cities',
        'do: error',
        error,
        'subscriber: error',
        error,
        'cleanup cities',
      ]);
    });

    test('Performs side effects on unsubscribe', () => {
      const list = [];

      const cities = RelayObservable.create(sink => {
        list.push('begin cities');
        sink.next('Athens');
        return () => list.push('cleanup cities');
      });

      const citiesWithSideEffects = cities.do({
        start() {
          list.push('do: started');
        },
        next(value) {
          list.push('do: value');
          list.push(value);
        },
        error(err) {
          list.push('do: error');
          list.push(err);
        },
        complete() {
          list.push('do: complete');
        },
        unsubscribe() {
          list.push('do: unsubscribe');
        },
      });

      const subscription = citiesWithSideEffects.subscribe({
        start() {
          list.push('subscriber: started');
        },
        next(value) {
          list.push('subscriber: value');
          list.push(value);
        },
        error(err) {
          list.push('subscriber: error');
          list.push(err);
        },
        complete() {
          list.push('subscriber: complete');
        },
        unsubscribe() {
          list.push('subscriber: unsubscribe');
        },
      });

      subscription.unsubscribe();

      expect(list).toEqual([
        'subscriber: started',
        'do: started',
        'begin cities',
        'do: value',
        'Athens',
        'subscriber: value',
        'Athens',
        'subscriber: unsubscribe',
        'do: unsubscribe',
        'cleanup cities',
      ]);
    });

    test('Does not affect subscription with unhandled errors', () => {
      const list = [];
      const error = new Error();

      const unhandled = jest.fn();
      RelayObservable.onUnhandledError(unhandled);

      const cities = RelayObservable.create(sink => {
        list.push('begin cities');
        sink.next('Athens');
        sink.next('Berlin');
        sink.complete();
        return () => list.push('cleanup cities');
      });

      const citiesWithSideEffects = cities.do({
        start() {
          list.push('do: started');
          throw error;
        },
        next(value) {
          list.push('do: value');
          list.push(value);
          throw error;
        },
        error(err) {
          list.push('do: error');
          list.push(err);
          throw error;
        },
        complete() {
          list.push('do: complete');
          throw error;
        },
      });

      citiesWithSideEffects.subscribe({
        start() {
          list.push('subscriber: started');
        },
        next(value) {
          list.push('subscriber: value');
          list.push(value);
        },
        error(err) {
          list.push('subscriber: error');
          list.push(err);
        },
        complete() {
          list.push('subscriber: complete');
        },
      });

      expect(list).toEqual([
        'subscriber: started',
        'do: started',
        'begin cities',
        'do: value',
        'Athens',
        'subscriber: value',
        'Athens',
        'do: value',
        'Berlin',
        'subscriber: value',
        'Berlin',
        'do: complete',
        'subscriber: complete',
        'cleanup cities',
      ]);

      expect(unhandled.mock.calls).toEqual([
        [error, true],
        [error, true],
        [error, true],
        [error, true],
      ]);
    });
  });

  describe('toPromise', () => {
    test('Converts an Observable into a Promise', async () => {
      let sink;
      const list = [];

      const obs = RelayObservable.create(_sink => {
        sink = _sink;
        return () => list.push('cleanup');
      });

      const promise = obs.toPromise();

      sink.next(1);
      sink.complete(1);

      await promise.then(
        val => list.push('resolve:' + val),
        err => list.push(err),
      );

      // Due to Promise resolving at the end of the frame, cleanup occurs first.
      expect(list).toEqual(['cleanup', 'resolve:1']);
    });

    test('Rejects Promise if error during source', async () => {
      const list = [];
      const error = new Error();

      const obs = RelayObservable.create(sink => {
        throw error;
      });

      const promise = obs.toPromise();

      await promise.then(
        val => list.push('resolve:' + val),
        err => list.push(err),
      );

      // Due to Promise resolving at the end of the frame, cleanup occurs first.
      expect(list).toEqual([error]);
    });

    test('Errors during cleanup are unhandled (sync)', async () => {
      const list = [];
      const error = new Error();

      const unhandled = jest.fn();
      RelayObservable.onUnhandledError(unhandled);

      const obs = RelayObservable.create(sink => {
        sink.next(1);
        sink.complete();
        return () => {
          throw error;
        };
      });

      const promise = obs.toPromise();

      await promise.then(
        val => list.push('resolve:' + val),
        err => list.push(err),
      );

      expect(list).toEqual(['resolve:1']);
      expect(unhandled.mock.calls).toEqual([[error, true]]);
    });

    test('Errors during cleanup are unhandled (async)', async () => {
      let sink;
      const list = [];
      const error = new Error();

      const unhandled = jest.fn();
      RelayObservable.onUnhandledError(unhandled);

      const obs = RelayObservable.create(_sink => {
        sink = _sink;
        return () => {
          throw error;
        };
      });

      const promise = obs.toPromise();

      sink.next(1);
      sink.complete();

      await promise.then(
        val => list.push('resolve:' + val),
        err => list.push(err),
      );

      expect(list).toEqual(['resolve:1']);
      expect(unhandled.mock.calls).toEqual([[error, true]]);
    });

    test('Resolves the first yielded value', async () => {
      let sink;
      const list = [];

      const obs = RelayObservable.create(_sink => {
        sink = _sink;
        return () => list.push('cleanup');
      });

      const promise = obs.toPromise();

      sink.next(1);
      sink.next(2);
      sink.next(3);
      sink.complete();

      await promise.then(
        val => list.push('resolve:' + val),
        err => list.push(err),
      );

      expect(list).toEqual(['cleanup', 'resolve:1']);
    });

    test('Cleans up a non-completing Observable', async () => {
      const list = [];

      const obs = RelayObservable.create(sink => {
        sink.next(1);
        return () => list.push('cleanup');
      });

      const promise = obs.toPromise();

      await promise.then(
        val => list.push('resolve:' + val),
        err => list.push(err),
      );

      expect(list).toEqual(['resolve:1']);
    });

    test('Converts an Observable error into a rejected Promise', async () => {
      let sink;
      const list = [];
      const error = new Error();

      const obs = RelayObservable.create(_sink => {
        sink = _sink;
        return () => list.push('cleanup');
      });

      const promise = obs.toPromise();

      sink.error(error);
      await promise.then(
        val => list.push('resolve:' + val),
        err => list.push(err),
      );

      // Due to Promise resolving at the end of the frame, cleanup occurs first.
      expect(list).toEqual(['cleanup', error]);
    });

    test('Converts an Observable complete into a resolved Promise', async () => {
      let sink;
      const list = [];

      const obs = RelayObservable.create(_sink => {
        sink = _sink;
        return () => list.push('cleanup');
      });

      const promise = obs.toPromise();

      sink.complete();
      await promise.then(
        val => list.push('resolve:' + val),
        err => list.push(err),
      );

      // Due to Promise resolving at the end of the frame, cleanup occurs first.
      expect(list).toEqual(['cleanup', 'resolve:undefined']);
    });

    test('Is the dual to from(Promise)', async () => {
      const value = {};
      const error = new Error();

      const resolved = RelayObservable.from(Promise.resolve(value)).toPromise();
      const rejected = RelayObservable.from(Promise.reject(error)).toPromise();

      expect(await resolved).toBe(value);
      expect(await rejected.catch(e => e)).toBe(error);
    });
  });

  describe('catch', () => {
    test('Catches sync errors', () => {
      const list = [];

      const obs1 = RelayObservable.create(sink => {
        throw new Error('sync error');
      });

      const obs2 = obs1.catch(e => RelayObservable.from('caught: ' + e));

      obs2.subscribe({
        next: val => list.push('next:' + val),
        error: err => list.push(err),
        complete: () => list.push('complete'),
      });

      expect(list).toEqual(['next:caught: Error: sync error', 'complete']);
    });

    test('Catches async errors', () => {
      let sink;
      const list = [];

      const obs1 = RelayObservable.create(_sink => {
        sink = _sink;
      });

      const obs2 = obs1.catch(e => RelayObservable.from('caught: ' + e));

      obs2.subscribe({
        next: val => list.push('next:' + val),
        error: err => list.push(err),
        complete: () => list.push('complete'),
      });

      sink.next(1);
      sink.error(new Error('async error'));

      expect(list).toEqual([
        'next:1',
        'next:caught: Error: async error',
        'complete',
      ]);
    });

    test('Supports re-throwing errors', () => {
      let sink;
      const list = [];
      const error = new Error();

      const obs1 = RelayObservable.create(_sink => {
        sink = _sink;
      });

      const obs2 = obs1.catch(e => {
        throw e;
      });

      obs2.subscribe({
        next: val => list.push('next:' + val),
        error: err => list.push(err),
        complete: () => list.push('complete'),
      });

      sink.next(1);
      sink.error(error);

      expect(list).toEqual(['next:1', error]);
    });

    test('Cleans up original observable', () => {
      let sink1;
      const list = [];

      const obs1 = RelayObservable.create(sink => {
        list.push('create first');
        sink1 = sink;
        return () => list.push('cleanup first');
      });

      const obs2 = RelayObservable.create(sink => {
        list.push('create second');
        return () => list.push('cleanup second');
      });

      const sub = obs1
        .catch(() => obs2)
        .subscribe({
          next: val => list.push('next:' + val),
          error: err => list.push(err),
          complete: () => list.push('complete'),
        });

      sink1.next(1);
      sub.unsubscribe();

      expect(list).toEqual(['create first', 'next:1', 'cleanup first']);
    });

    test('Cleans up replaced observable', () => {
      let sink1;
      let sink2;
      const list = [];

      const obs1 = RelayObservable.create(sink => {
        list.push('create first');
        sink1 = sink;
        return () => list.push('cleanup first');
      });

      const obs2 = RelayObservable.create(sink => {
        list.push('create second');
        sink2 = sink;
        return () => list.push('cleanup second');
      });

      const sub = obs1
        .catch(() => obs2)
        .subscribe({
          next: val => list.push('next:' + val),
          error: err => list.push(err),
          complete: () => list.push('complete'),
        });

      sink1.next(1);
      sink1.error(new Error());
      sink2.next(2);
      sub.unsubscribe();

      expect(list).toEqual([
        'create first',
        'next:1',
        'create second',
        'cleanup first',
        'next:2',
        'cleanup second',
      ]);
    });
  });

  describe('finally', () => {
    test('should call finally after complete and cleanup', () => {
      const list = [];

      const obs = RelayObservable.create(sink => {
        sink.next(1);
        sink.complete();
        return () => list.push('cleanup');
      });

      obs
        .finally(() => list.push('finally'))
        .subscribe({
          next: val => list.push('next:' + val),
          error: () => list.push('error'),
          complete: () => list.push('complete'),
          unsubscribe: () => list.push('unsubscribe'),
        });

      expect(list).toEqual(['next:1', 'complete', 'cleanup', 'finally']);
    });

    test('should call finally after error', () => {
      const list = [];

      const obs = RelayObservable.create(sink => {
        sink.error(new Error());
        return () => list.push('cleanup');
      });

      obs
        .finally(() => list.push('finally'))
        .subscribe({
          next: val => list.push('next:' + val),
          error: () => list.push('error'),
          complete: () => list.push('complete'),
          unsubscribe: () => list.push('unsubscribe'),
        });

      expect(list).toEqual(['error', 'cleanup', 'finally']);
    });

    test('should call finally after unsubscribe', () => {
      const list = [];

      const obs = RelayObservable.create(sink => {
        sink.next(1);
        return () => list.push('cleanup');
      });

      const sub = obs
        .finally(() => list.push('finally'))
        .subscribe({
          next: val => list.push('next:' + val),
          error: () => list.push('error'),
          complete: () => list.push('complete'),
          unsubscribe: () => list.push('unsubscribe'),
        });

      sub.unsubscribe();

      expect(list).toEqual(['next:1', 'unsubscribe', 'cleanup', 'finally']);
    });
  });
});
