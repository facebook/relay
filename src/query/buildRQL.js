/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule buildRQL
 * @flow
 * @typechecks
 */

'use strict';

import type {
  ConcreteFragment,
  ConcreteQuery,
} from 'ConcreteQuery';
var Map = require('Map');
var QueryBuilder = require('QueryBuilder');
import type {RelayConcreteNode} from 'RelayQL';
var RelayProfiler = require('RelayProfiler');
import type {RelayContainer, Variables} from 'RelayTypes';

var filterObject = require('filterObject');
var invariant = require('invariant');
var mapObject = require('mapObject');

export type RelayQLFragmentBuilder =
  (variables: Variables) => RelayConcreteNode;
export type RelayQLQueryBuilder =
  (Component: RelayContainer, params: Variables) => RelayConcreteNode;

// Cache results of executing fragment query builders.
var fragmentCache = new Map();

// Cache results of executing component-specific route query builders.
var queryCache = new Map();

function isDeprecatedCallWithArgCountGreaterThan(
  nodeBuilder: Function,
  count: number
): boolean {
  var argLength = nodeBuilder.length;
  if (__DEV__) {
    var mockImpl = nodeBuilder;
    while (mockImpl && mockImpl._getMockImplementation) {
      mockImpl = mockImpl._getMockImplementation();
    }
    if (mockImpl) {
      argLength = mockImpl.length;
    }
  }
  return argLength > count;
}

/**
 * @internal
 *
 * Builds a static node representation using a supplied query or fragment
 * builder. This is used for routes, containers, and mutations.
 *
 * If the supplied fragment builder produces an invalid node (e.g. the wrong
 * node type), these will return `undefined`. This is not to be confused with
 * a return value of `null`, which may result from the lack of a node.
 */
var buildRQL = {
  Fragment(
    fragmentBuilder: RelayQLFragmentBuilder,
    values: Variables
  ): ?ConcreteFragment {
    var node = fragmentCache.get(fragmentBuilder);
    if (!node) {
      var variables = toVariables(values);
      invariant(
        !isDeprecatedCallWithArgCountGreaterThan(fragmentBuilder, 1),
        'Relay.QL: Deprecated usage detected. If you are trying to define a ' +
        'fragment, use `variables => Relay.QL`.'
      );
      node = fragmentBuilder(variables);
      fragmentCache.set(fragmentBuilder, node);
    }
    if (node) {
      return QueryBuilder.getFragment(node);
    }
  },

  Query(
    queryBuilder: RelayQLQueryBuilder,
    Component: any,
    queryName: string,
    values: Variables
  ): ?ConcreteQuery {
    let componentCache = queryCache.get(queryBuilder);
    let node;
    if (!componentCache) {
      componentCache = new Map();
      queryCache.set(queryBuilder, componentCache);
    } else {
      node = componentCache.get(Component);
    }
    if (!node) {
      const variables = toVariables(values);
      invariant(
        !isDeprecatedCallWithArgCountGreaterThan(queryBuilder, 2),
        'Relay.QL: Deprecated usage detected. If you are trying to define a ' +
        'query, use `(Component, variables) => Relay.QL`.'
      );
      if (isDeprecatedCallWithArgCountGreaterThan(queryBuilder, 0)) {
        node = queryBuilder(Component, variables);
      } else {
        node = queryBuilder(Component, variables);
        const query = QueryBuilder.getQuery(node);
        if (query) {
          let hasFragment = false;
          let hasScalarFieldsOnly = true;
          if (query.children) {
            query.children.forEach(child => {
              if (child) {
                hasFragment = hasFragment || child.kind === 'Fragment';
                hasScalarFieldsOnly = hasScalarFieldsOnly && (
                  child.kind === 'Field' &&
                  (!child.children || child.children.length === 0)
                );
              }
            });
          }
          if (!hasFragment) {
            const children = query.children ? [...query.children] : [];
            invariant(
              hasScalarFieldsOnly,
              'Relay.QL: Expected query `%s` to be empty. For example, use ' +
              '`node(id: $id)`, not `node(id: $id) { ... }`.',
              query.fieldName
            );
            const fragmentValues = filterObject(values, (_, name) =>
              Component.hasVariable(name)
            );
            children.push(Component.getFragment(queryName, fragmentValues));
            node = {
              ...query,
              children,
            };
          }
        }
      }
      componentCache.set(Component, node);
    }
    if (node) {
      return QueryBuilder.getQuery(node) || undefined;
    }
    return null;
  },
};

function toVariables(variables: Variables): {
  [key: string]: $FlowIssue; // ConcreteCallVariable should flow into mixed
} {
  return mapObject(
    variables,
    (_, name) => QueryBuilder.createCallVariable(name)
  );
}

RelayProfiler.instrumentMethods(buildRQL, {
  Fragment: 'buildRQL.Fragment',
  Query: 'buildRQL.Query',
});

module.exports = buildRQL;
