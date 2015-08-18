/**
 * Copyright 2013-2015, Facebook, Inc.
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

var Map = require('Map');
import type {
  RelayLazyContainer,
  RelayQueryConfig
} from 'RelayContainer';
import type {RelayQuerySet} from 'RelayInternalTypes';
var RelayMetaRoute = require('RelayMetaRoute');
var RelayProfiler = require('RelayProfiler');
var RelayQuery = require('RelayQuery');

var buildRQL = require('buildRQL');
var invariant = require('invariant');
var stableStringify = require('stableStringify');

var queryCache = new Map();

/**
 * @internal
 *
 * `getRelayQueries` retrieves all queries for a component given a route.
 */
function getRelayQueries(
  Component: RelayLazyContainer,
  route: RelayQueryConfig
): RelayQuerySet {
  if (!queryCache.has(Component)) {
    queryCache.set(Component, {});
  }
  var cacheKey = route.name + ':' + stableStringify(route.params);
  var cache = queryCache.get(Component);
  if (cache.hasOwnProperty(cacheKey)) {
    return cache[cacheKey];
  }
  var querySet = {};
  Object.keys(route.queries).forEach(queryName => {
    invariant(
      Component.hasFragment(queryName),
      'Relay.QL: query `%s.queries.%s` is invalid, expected fragment ' +
      '`%s.fragments.%s` to be defined.',
      route.name,
      queryName,
      Component.displayName,
      queryName
    );
    var queryBuilder = route.queries[queryName];
    if (queryBuilder) {
      var concreteQuery = buildRQL.Query(
        queryBuilder,
        Component,
        Object.keys(route.params),
        Component.getFragment(queryName, route.params)
      );
      invariant(
        concreteQuery !== undefined,
        'Relay.QL: query `%s.queries.%s` is invalid, a typical query is ' +
        'defined using: () => Relay.QL`query { ... }`.',
        route.name,
        queryName
      );
      if (concreteQuery) {
        var rootQuery = RelayQuery.Node.createQuery(
          concreteQuery,
          RelayMetaRoute.get(route.name),
          route.params
        );
        var rootCall = rootQuery.getRootCall();
        if (rootCall.value !== undefined) {
          querySet[queryName] = rootQuery;
          return;
        }
      }
    }
    querySet[queryName] = null;
  });
  cache[cacheKey] = querySet;
  return querySet;
}

module.exports = RelayProfiler.instrument('Relay.getQueries', getRelayQueries);
