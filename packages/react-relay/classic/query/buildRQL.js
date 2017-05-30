/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule buildRQL
 * @flow
 * @format
 */

'use strict';

const Map = require('Map');
const QueryBuilder = require('QueryBuilder');
const RelayProfiler = require('RelayProfiler');
const RelayQueryCaching = require('RelayQueryCaching');

const filterObject = require('filterObject');
const invariant = require('invariant');
const mapObject = require('mapObject');

import type {ConcreteFragment, ConcreteQuery} from 'ConcreteQuery';
import type {RelayConcreteNode} from 'RelayQL';
import type {RelayContainer, Variables} from 'RelayTypes';

export type RelayQLFragmentBuilder = (
  variables: Variables,
) => RelayConcreteNode;
export type RelayQLQueryBuilder = (
  Component: RelayContainer,
  params: Variables,
) => RelayConcreteNode;

// Cache results of executing fragment query builders.
const fragmentCache = new Map();

// Cache results of executing component-specific route query builders.
const queryCache = new Map();

function isDeprecatedCallWithArgCountGreaterThan(
  nodeBuilder: Function,
  count: number,
): boolean {
  let argLength = nodeBuilder.length;
  if (__DEV__) {
    let mockImpl = nodeBuilder;
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
const buildRQL = {
  Fragment(
    fragmentBuilder: RelayQLFragmentBuilder,
    values: Variables,
  ): ?ConcreteFragment {
    let node = fragmentCache.get(fragmentBuilder);
    if (node) {
      return QueryBuilder.getFragment(node);
    }
    const variables = toVariables(values);
    invariant(
      !isDeprecatedCallWithArgCountGreaterThan(fragmentBuilder, 1),
      'Relay.QL: Deprecated usage detected. If you are trying to define a ' +
        'fragment, use `variables => Relay.QL`.',
    );
    node = fragmentBuilder(variables);
    const fragment = node != null ? QueryBuilder.getFragment(node) : null;
    if (!fragment) {
      return fragment;
    }
    fragmentCache.set(fragmentBuilder, fragment);
    return fragment;
  },

  Query(
    queryBuilder: RelayQLQueryBuilder,
    Component: any,
    queryName: string,
    values: Variables,
  ): ?ConcreteQuery {
    const queryCacheEnabled = RelayQueryCaching.getEnabled();
    let node;
    if (!queryCacheEnabled) {
      node = buildNode(queryBuilder, Component, queryName, values);
    } else {
      let componentCache = queryCache.get(queryBuilder);
      if (!componentCache) {
        componentCache = new Map();
        queryCache.set(queryBuilder, componentCache);
      } else {
        node = componentCache.get(Component);
      }
      if (!node) {
        node = buildNode(queryBuilder, Component, queryName, values);
      }
      componentCache.set(Component, node);
    }
    if (node) {
      return QueryBuilder.getQuery(node) || undefined;
    }
    return null;
  },
};

/**
 * @internal
 */
function buildNode(
  queryBuilder: RelayQLQueryBuilder,
  Component: any,
  queryName: string,
  values: Variables,
): ?mixed {
  const variables = toVariables(values);
  invariant(
    !isDeprecatedCallWithArgCountGreaterThan(queryBuilder, 2),
    'Relay.QL: Deprecated usage detected. If you are trying to define a ' +
      'query, use `(Component, variables) => Relay.QL`.',
  );
  let node;
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
            hasScalarFieldsOnly =
              hasScalarFieldsOnly &&
              (child.kind === 'Field' &&
                (!child.children || child.children.length === 0));
          }
        });
      }
      if (!hasFragment) {
        const children = query.children ? [...query.children] : [];
        invariant(
          hasScalarFieldsOnly,
          'Relay.QL: Expected query `%s` to be empty. For example, use ' +
            '`node(id: $id)`, not `node(id: $id) { ... }`.',
          query.fieldName,
        );
        const fragmentVariables = filterObject(variables, (_, name) =>
          Component.hasVariable(name),
        );
        children.push(Component.getFragment(queryName, fragmentVariables));
        node = {
          ...query,
          children,
        };
      }
    }
  }
  return node;
}

function toVariables(
  variables: Variables,
): {
  [key: string]: $FlowIssue, // ConcreteCallVariable should flow into mixed
} {
  return mapObject(variables, (_, name) =>
    QueryBuilder.createCallVariable(name),
  );
}

RelayProfiler.instrumentMethods(buildRQL, {
  Fragment: 'buildRQL.Fragment',
  Query: 'buildRQL.Query',
});

module.exports = buildRQL;
