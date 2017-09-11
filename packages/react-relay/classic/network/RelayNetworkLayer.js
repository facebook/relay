/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayNetworkLayer
 * @flow
 * @format
 */

'use strict';

const RelayProfiler = require('RelayProfiler');
const RelayQueryRequest = require('RelayQueryRequest');

const invariant = require('invariant');
const resolveImmediate = require('resolveImmediate');
const throwFailedPromise = require('throwFailedPromise');
const warning = require('warning');

import type RelayMutationRequest from 'RelayMutationRequest';
import type RelayQuery from 'RelayQuery';
import type {ChangeSubscription, NetworkLayer} from 'RelayTypes';

type Subscriber = {
  queryCallback: ?QueryCallback,
  mutationCallback: ?MutationCallback,
};

export type MutationCallback = (request: RelayMutationRequest) => void;
export type QueryCallback = (request: RelayQueryRequest) => void;

/**
 * @internal
 *
 * `RelayNetworkLayer` provides a method to inject custom network behavior.
 */
class RelayNetworkLayer {
  _defaultImplementation: ?NetworkLayer;
  _implementation: ?NetworkLayer;
  _queue: ?Array<RelayQueryRequest>;
  _subscribers: Array<Subscriber>;

  constructor() {
    this._implementation = null;
    this._queue = null;
    this._subscribers = [];
  }

  /**
   * @internal
   */
  injectDefaultImplementation(implementation: ?NetworkLayer): void {
    if (this._defaultImplementation) {
      warning(
        false,
        'RelayNetworkLayer: Call received to injectDefaultImplementation(), ' +
          'but a default layer was already injected.',
      );
    }
    this._defaultImplementation = implementation;
  }

  injectImplementation(implementation: ?NetworkLayer): void {
    if (this._implementation) {
      warning(
        false,
        'RelayNetworkLayer: Call received to injectImplementation(), but ' +
          'a layer was already injected.',
      );
    }
    this._implementation = implementation;
  }

  addNetworkSubscriber(
    queryCallback?: ?QueryCallback,
    mutationCallback?: ?MutationCallback,
  ): ChangeSubscription {
    const index = this._subscribers.length;
    this._subscribers.push({queryCallback, mutationCallback});
    return {
      remove: () => {
        delete this._subscribers[index];
      },
    };
  }

  sendMutation(mutationRequest: RelayMutationRequest): void {
    const implementation = this._getImplementation();
    this._subscribers.forEach(({mutationCallback}) => {
      if (mutationCallback) {
        mutationCallback(mutationRequest);
      }
    });
    const maybePromise = implementation.sendMutation(mutationRequest);
    if (maybePromise) {
      throwFailedPromise(Promise.resolve(maybePromise));
    }
  }

  sendQueries(queryRequests: Array<RelayQueryRequest>): void {
    profileQueue(queryRequests);
    const implementation = this._getImplementation();
    this._subscribers.forEach(({queryCallback}) => {
      if (queryCallback) {
        queryRequests.forEach(request => {
          // $FlowIssue #10907496 queryCallback was checked above
          queryCallback(request);
        });
      }
    });
    const maybePromise = implementation.sendQueries(queryRequests);
    if (maybePromise) {
      throwFailedPromise(Promise.resolve(maybePromise));
    }
  }

  supports(...options: Array<string>): boolean {
    const implementation = this._getImplementation();
    return implementation.supports(...options);
  }

  _getImplementation(): NetworkLayer {
    const implementation = this._implementation || this._defaultImplementation;
    invariant(
      implementation,
      'RelayNetworkLayer: Use `RelayEnvironment.injectNetworkLayer` to ' +
        'configure a network layer.',
    );
    return implementation;
  }

  /**
   * Schedules the supplied `query` to be sent to the server.
   *
   * This is a low-level transport API; application code should use higher-level
   * interfaces exposed by RelayContainer for retrieving data transparently via
   * queries defined on components.
   */
  fetchRelayQuery(query: RelayQuery.Root): Promise<any> {
    const currentQueue = this._queue || [];
    if (!this._queue) {
      this._queue = currentQueue;
      resolveImmediate(() => {
        this._queue = null;
        this.sendQueries(currentQueue);
      });
    }
    const request = new RelayQueryRequest(query);
    currentQueue.push(request);
    return request.getPromise();
  }
}

/**
 * Profiles time from request to receiving the first server response.
 */
function profileQueue(currentQueue: Array<RelayQueryRequest>): void {
  // TODO #8783781: remove aggregate `fetchRelayQuery` profiler
  let firstResultProfiler = RelayProfiler.profile('fetchRelayQuery');
  currentQueue.forEach(query => {
    const profiler = RelayProfiler.profile(
      'fetchRelayQuery.query',
      query.getQuery().getName(),
    );
    const onSettle = () => {
      profiler.stop();
      if (firstResultProfiler) {
        firstResultProfiler.stop();
        firstResultProfiler = null;
      }
    };
    query.done(onSettle, onSettle);
  });
}

RelayProfiler.instrumentMethods(RelayNetworkLayer.prototype, {
  sendMutation: 'RelayNetworkLayer.sendMutation',
  sendQueries: 'RelayNetworkLayer.sendQueries',
});

module.exports = RelayNetworkLayer;
