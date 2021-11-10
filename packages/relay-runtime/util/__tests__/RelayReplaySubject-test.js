/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @flow strict-local
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

import type {Subscription} from 'relay-runtime';

const RelayReplaySubject = require('../RelayReplaySubject');

let subject;

beforeEach(() => {
  subject = new RelayReplaySubject();
});

type Observer = {|
  +complete: JestMockFn<$ReadOnlyArray<mixed>, mixed>,
  +error: JestMockFn<$ReadOnlyArray<mixed>, mixed>,
  +next: JestMockFn<$ReadOnlyArray<mixed>, mixed>,
  +start: JestMockFn<$ReadOnlyArray<Subscription>, mixed>,
  +unsubscribe: JestMockFn<$ReadOnlyArray<mixed>, mixed>,
|};

function createObserver(): Observer {
  return {
    complete: jest.fn(),
    error: jest.fn(),
    next: jest.fn(),
    start: jest.fn(),
    unsubscribe: jest.fn(),
  };
}

function clearObserver(observer: Observer) {
  observer.complete.mockClear();
  observer.error.mockClear();
  observer.next.mockClear();
  observer.start.mockClear();
  observer.unsubscribe.mockClear();
}

it('publishes start before next/error', () => {
  const error = new Error('wtf');
  subject.next('Alice');
  subject.error(error);

  const observer = createObserver();
  observer.next.mockImplementation(() => {
    expect(observer.start).toBeCalledTimes(1);
  });
  observer.error.mockImplementation(() => {
    expect(observer.start).toBeCalledTimes(1);
  });
  subject.subscribe(observer);
  expect(observer.start).toBeCalledTimes(1);
  expect(observer.error).toBeCalledTimes(1);
  expect(observer.error.mock.calls[0][0]).toBe(error);
  expect(observer.next).toBeCalledTimes(1);
  expect(observer.next.mock.calls[0][0]).toBe('Alice');
  expect(observer.complete).toBeCalledTimes(0);
});

it('publishes start before next/complete', () => {
  subject.next('Alice');
  subject.complete();

  const observer = createObserver();
  observer.next.mockImplementation(() => {
    expect(observer.start).toBeCalledTimes(1);
  });
  observer.complete.mockImplementation(() => {
    expect(observer.start).toBeCalledTimes(1);
  });
  subject.subscribe(observer);
  expect(observer.start).toBeCalledTimes(1);
  expect(observer.error).toBeCalledTimes(0);
  expect(observer.next).toBeCalledTimes(1);
  expect(observer.next.mock.calls[0][0]).toBe('Alice');
  expect(observer.complete).toBeCalledTimes(1);
});

it('publishes next before complete/error', () => {
  subject.next('Alice');

  const observer = createObserver();
  subject.subscribe(observer);
  expect(observer.start).toBeCalledTimes(1);
  expect(observer.error).toBeCalledTimes(0);
  expect(observer.next).toBeCalledTimes(1);
  expect(observer.next.mock.calls[0][0]).toBe('Alice');
  expect(observer.complete).toBeCalledTimes(0);

  subject.complete();
  expect(observer.complete).toBeCalledTimes(1);
});

it('stops publishing when unsubscribing in start', () => {
  subject.next('Alice');
  subject.next('Bob');
  subject.complete();

  const observer = createObserver();
  observer.start.mockImplementation(subscription => {
    subscription.unsubscribe();
  });
  subject.subscribe(observer);

  expect(observer.start).toBeCalledTimes(1);
  expect(observer.error).toBeCalledTimes(0);
  expect(observer.next).toBeCalledTimes(0);
  expect(observer.complete).toBeCalledTimes(0);
});

it('stops publishing when unsubscribing in next', () => {
  subject.next('Alice');
  subject.next('Bob');
  subject.complete();

  const observer = createObserver();
  let subscription;
  observer.start.mockImplementation(sub => {
    subscription = sub;
  });
  observer.next.mockImplementation(() => {
    subscription.unsubscribe();
  });
  subject.subscribe(observer);

  expect(observer.start).toBeCalledTimes(1);
  expect(observer.error).toBeCalledTimes(0);
  expect(observer.next).toBeCalledTimes(1);
  expect(observer.complete).toBeCalledTimes(0);
});

it('publishes events synchronously when subscribing to an already resolved stream ', () => {
  subject.next('Alice');
  subject.next('Bob');
  subject.complete();

  const observer = createObserver();
  subject.subscribe(observer);
  expect(observer.complete).toBeCalledTimes(1);
  expect(observer.error).toBeCalledTimes(0);
  expect(observer.next).toBeCalledTimes(2);
  expect(observer.next.mock.calls[0][0]).toBe('Alice');
  expect(observer.next.mock.calls[1][0]).toBe('Bob');
  expect(observer.start).toBeCalledTimes(1);
});

it('publishes next/complete events to an existing subscriber', () => {
  const observer = createObserver();
  subject.subscribe(observer);

  subject.next('Alice');
  subject.next('Bob');
  subject.complete();

  expect(observer.complete).toBeCalledTimes(1);
  expect(observer.error).toBeCalledTimes(0);
  expect(observer.next).toBeCalledTimes(2);
  expect(observer.next.mock.calls[0][0]).toBe('Alice');
  expect(observer.next.mock.calls[1][0]).toBe('Bob');
  expect(observer.start).toBeCalledTimes(1);
});

it('publishes events synchronously when subscribing to an ongoing stream ', () => {
  subject.next('Alice');
  subject.next('Bob');

  const observer = createObserver();
  subject.subscribe(observer);

  expect(observer.complete).toBeCalledTimes(0);
  expect(observer.error).toBeCalledTimes(0);
  expect(observer.next).toBeCalledTimes(2);
  expect(observer.next.mock.calls[0][0]).toBe('Alice');
  expect(observer.next.mock.calls[1][0]).toBe('Bob');
  expect(observer.start).toBeCalledTimes(1);

  subject.next('Jon');
  subject.complete();

  expect(observer.complete).toBeCalledTimes(1);
  expect(observer.error).toBeCalledTimes(0);
  expect(observer.next).toBeCalledTimes(3);
  expect(observer.next.mock.calls[2][0]).toBe('Jon');
  expect(observer.start).toBeCalledTimes(1);
});

it('publishes subsequent next/complete events to an existing subscriber', () => {
  const observer = createObserver();
  subject.next('Alice');
  subject.subscribe(observer);
  clearObserver(observer);

  subject.next('Bob');
  subject.complete();

  expect(observer.complete).toBeCalledTimes(1);
  expect(observer.error).toBeCalledTimes(0);
  expect(observer.next).toBeCalledTimes(1);
  expect(observer.next.mock.calls[0][0]).toBe('Bob');
  expect(observer.start).toBeCalledTimes(0);
});

it('publishes events synchronously when subscribing to an already rejected stream', () => {
  const error = new Error('wtf');
  subject.error(error);

  const observer = createObserver();
  subject.subscribe(observer);
  expect(observer.complete).toBeCalledTimes(0);
  expect(observer.error).toBeCalledTimes(1);
  expect(observer.error.mock.calls[0][0]).toBe(error);
  expect(observer.next).toBeCalledTimes(0);
  expect(observer.start).toBeCalledTimes(1);
});

it('publishes error events to an an existing subscriber', () => {
  const observer = createObserver();
  subject.subscribe(observer);

  const error = new Error('wtf');
  subject.error(error);
  expect(observer.complete).toBeCalledTimes(0);
  expect(observer.error).toBeCalledTimes(1);
  expect(observer.error.mock.calls[0][0]).toBe(error);
  expect(observer.next).toBeCalledTimes(0);
  expect(observer.start).toBeCalledTimes(1);
});

it('publishes subsequent next/error events to an existing subscriber', () => {
  const observer = createObserver();
  subject.next('Alice');
  subject.subscribe(observer);
  clearObserver(observer);

  const error = new Error('wtf');
  subject.next('Bob');
  subject.error(error);

  expect(observer.complete).toBeCalledTimes(0);
  expect(observer.error).toBeCalledTimes(1);
  expect(observer.error.mock.calls[0][0]).toBe(error);
  expect(observer.next).toBeCalledTimes(1);
  expect(observer.next.mock.calls[0][0]).toBe('Bob');
  expect(observer.start).toBeCalledTimes(0);
});

describe('with multiple subscribers', () => {
  it('returns current observers count', () => {
    const observer = createObserver();

    subject.subscribe(observer);
    subject.subscribe(observer);
    const subscriptionToUnsubscribe = subject.subscribe(observer);
    expect(subject.getObserverCount()).toBe(3);
    clearObserver(observer);

    subscriptionToUnsubscribe.unsubscribe();
    expect(observer.unsubscribe).toBeCalledTimes(1);
    expect(subject.getObserverCount()).toBe(2);

    subject.complete();
    expect(observer.complete).toBeCalledTimes(2);
    expect(subject.getObserverCount()).toBe(0);
  });

  it('publish next/complete events to all subscribers', () => {
    const observer1 = createObserver();
    const observer2 = createObserver();

    subject.subscribe(observer1);
    subject.next('Alice');
    expect(observer1.next).toBeCalledTimes(1);
    expect(observer1.next).toBeCalledWith('Alice');

    subject.subscribe(observer2);
    expect(observer2.next).toBeCalledTimes(1);
    expect(observer2.next).toBeCalledWith('Alice');

    subject.next('Bob');
    expect(observer1.next).toBeCalledTimes(2);
    expect(observer1.next).toHaveBeenNthCalledWith(2, 'Bob');
    expect(observer2.next).toBeCalledTimes(2);
    expect(observer2.next).toHaveBeenNthCalledWith(2, 'Bob');
    expect(observer1.complete).toBeCalledTimes(0);
    expect(observer2.complete).toBeCalledTimes(0);

    subject.complete();
    expect(observer1.complete).toBeCalledTimes(1);
    expect(observer2.complete).toBeCalledTimes(1);
  });

  it('publish unsubscribe events to all existing subscribers', () => {
    const observer1 = createObserver();
    const observer2 = createObserver();
    subject.next('Alice');
    subject.subscribe(observer1);
    subject.subscribe(observer2);

    subject.unsubscribe();
    expect(observer1.next).toBeCalledTimes(1);
    expect(observer1.next).toBeCalledWith('Alice');
    expect(observer1.unsubscribe).toBeCalledTimes(1);
    expect(observer1.error).toBeCalledTimes(0);
    expect(observer1.complete).toBeCalledTimes(0);

    expect(observer1.next).toBeCalledTimes(1);
    expect(observer1.next).toBeCalledWith('Alice');
    expect(observer2.unsubscribe).toBeCalledTimes(1);
    expect(observer2.error).toBeCalledTimes(0);
    expect(observer2.complete).toBeCalledTimes(0);
  });
});
