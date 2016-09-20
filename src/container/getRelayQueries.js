/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule getRelayQueries
 * @flow
 */

'use strict';

const Map = require('Map');
const RelayMetaRoute = require('RelayMetaRoute');
const RelayProfiler = require('RelayProfiler');
const RelayQuery = require('RelayQuery');
const RelayQueryCaching = require('RelayQueryCaching');

const buildRQL = require('buildRQL');
const invariant = require('invariant');
const stableStringify = require('stableStringify');
const warning = require('warning');

import type {RelayLazyContainer} from 'RelayContainer';
import type {RelayQuerySet} from 'RelayInternalTypes';
import type {RelayQueryConfigInterface} from 'RelayQueryConfig';

const queryCache = new Map();

/**
 * @internal
 *
 * `getRelayQueries` retrieves all queries for a component given a route.
 */
function getRelayQueries(
  Component: RelayLazyContainer,
  route: RelayQueryConfigInterface
): RelayQuerySet {
  const queryCachingEnabled = RelayQueryCaching.getEnabled();
  if (!queryCachingEnabled) {
    return buildQuerySet(Component, route);
  }
  let cache = queryCache.get(Component);
  if (!cache) {
    cache = {};
    queryCache.set(Component, cache);
  }
  const cacheKey = route.name + ':' + stableStringify(route.params);
  if (cache.hasOwnProperty(cacheKey)) {
    return cache[cacheKey];
  }
  const querySet = buildQuerySet(Component, route);
  cache[cacheKey] = querySet;
  return querySet;
}

/**
 * @internal
 */
function buildQuerySet(
  Component: RelayLazyContainer,
  route: RelayQueryConfigInterface
): RelayQuerySet {
  const querySet = {};
  Component.getFragmentNames().forEach(fragmentName => {
    querySet[fragmentName] = null;
  });
  Object.keys(route.queries).forEach(queryName => {
    if (!Component.hasFragment(queryName)) {
      warning(
        false,
        'Relay.QL: query `%s.queries.%s` is invalid, expected fragment ' +
        '`%s.fragments.%s` to be defined.',
        route.name,
        queryName,
        Component.displayName,
        queryName
      );
      return;
    }
    const queryBuilder = route.queries[queryName];
    if (queryBuilder) {
      const concreteQuery = buildRQL.Query(
        queryBuilder,
        Component,
        queryName,
        route.params
      );
      invariant(
        concreteQuery !== undefined,
        'Relay.QL: query `%s.queries.%s` is invalid, a typical query is ' +
        'defined using: () => Relay.QL`query { ... }`.',
        route.name,
        queryName
      );
      if (concreteQuery) {
        const rootQuery = RelayQuery.Root.create(
          concreteQuery,
          RelayMetaRoute.get(route.name),
          route.params
        );
        const identifyingArg = rootQuery.getIdentifyingArg();
        if (!identifyingArg || identifyingArg.value !== undefined) {
          querySet[queryName] = rootQuery;
          return;
        }
      }
    }
    querySet[queryName] = null;
  });
  return querySet;
}

module.exports = RelayProfiler.instrument('Relay.getQueries', getRelayQueries);
