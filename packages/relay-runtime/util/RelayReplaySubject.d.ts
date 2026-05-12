/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {Observer, Sink, Subscription} from '../network/RelayObservable';

export type Event<T> = { kind: 'next'; data: T } | { kind: 'error'; error: Error } | { kind: 'complete' };

/**
 * An implementation of a `ReplaySubject` for Relay Observables.
 *
 * Records events provided and synchronously plays them back to new subscribers,
 * as well as forwarding new asynchronous events.
 */
export class RelayReplaySubject<T> {
    complete(): void;
    error(error: Error): void;
    next(data: T): void;
    subscribe(observer: Observer<T> | Sink<T>): Subscription;
    unsubscribe(): void;
    getObserverCount(): number;
}
