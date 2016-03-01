/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule getRelayQueries
 * 
 */

'use strict';

var _Object$keys = require('babel-runtime/core-js/object/keys')['default'];

var Map = require('fbjs/lib/Map');

var RelayMetaRoute = require('./RelayMetaRoute');
var RelayProfiler = require('./RelayProfiler');
var RelayQuery = require('./RelayQuery');

var buildRQL = require('./buildRQL');
var invariant = require('fbjs/lib/invariant');
var stableStringify = require('./stableStringify');
var warning = require('fbjs/lib/warning');

var queryCache = new Map();

/**
 * @internal
 *
 * `getRelayQueries` retrieves all queries for a component given a route.
 */
function getRelayQueries(Component, route) {
  if (!queryCache.has(Component)) {
    queryCache.set(Component, {});
  }
  var cacheKey = route.name + ':' + stableStringify(route.params);
  /* $FlowFixMe(>=0.22.0): Error discovered while adding Flow types
   * to Map and Set. This is often because .get() can return null.
   */
  var cache = queryCache.get(Component);
  if (cache.hasOwnProperty(cacheKey)) {
    return cache[cacheKey];
  }
  var querySet = {};
  Component.getFragmentNames().forEach(function (fragmentName) {
    querySet[fragmentName] = null;
  });
  _Object$keys(route.queries).forEach(function (queryName) {
    if (!Component.hasFragment(queryName)) {
      process.env.NODE_ENV !== 'production' ? warning(false, 'Relay.QL: query `%s.queries.%s` is invalid, expected fragment ' + '`%s.fragments.%s` to be defined.', route.name, queryName, Component.displayName, queryName) : undefined;
      return;
    }
    var queryBuilder = route.queries[queryName];
    if (queryBuilder) {
      var concreteQuery = buildRQL.Query(queryBuilder, Component, queryName, route.params);
      !(concreteQuery !== undefined) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Relay.QL: query `%s.queries.%s` is invalid, a typical query is ' + 'defined using: () => Relay.QL`query { ... }`.', route.name, queryName) : invariant(false) : undefined;
      if (concreteQuery) {
        var rootQuery = RelayQuery.Root.create(concreteQuery, RelayMetaRoute.get(route.name), route.params);
        var identifyingArg = rootQuery.getIdentifyingArg();
        if (!identifyingArg || identifyingArg.value !== undefined) {
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