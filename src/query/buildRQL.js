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

var GraphQL = require('GraphQL');
var Map = require('Map');
var RelayQL = require('RelayQL');
var RelayFragmentReference = require('RelayFragmentReference');
import type {RelayConcreteNode} from 'RelayQL';
import type {Params} from 'RelayRoute';
import type {RelayContainer, Variables} from 'RelayTypes';

var invariant = require('invariant');

export type FragmentBuilder = (variables: Variables) => RelayConcreteNode;
export type QueryBuilder =
  (Component: RelayContainer, params: Params) => RelayConcreteNode;

type VariableNames = Array<string>;

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
    fragmentBuilder: FragmentBuilder,
    variableNames: VariableNames
  ): ?GraphQL.QueryFragment {
    var node = fragmentCache.get(fragmentBuilder);
    if (!node) {
      var variables = toVariables(variableNames);
      if (isDeprecatedCallWithArgCountGreaterThan(fragmentBuilder, 1)) {
        // TODO: Delete legacy support, (_, query, variables) => query`...`.
        node = (fragmentBuilder: any)(undefined, RelayQL, variables);
      } else {
        node = fragmentBuilder(variables);
      }
      fragmentCache.set(fragmentBuilder, node);
    }
    return GraphQL.isFragment(node) ? node : undefined;
  },

  Query(
    queryBuilder: QueryBuilder,
    Component: any,
    variableNames: VariableNames,
    fragmentReference: RelayFragmentReference
  ): ?GraphQL.Query {
    var componentCache = queryCache.get(queryBuilder);
    var node;
    if (!componentCache) {
      componentCache = new Map();
      queryCache.set(queryBuilder, componentCache);
    } else {
      node = componentCache.get(Component);
    }
    if (!node) {
      var variables = toVariables(variableNames);
      if (isDeprecatedCallWithArgCountGreaterThan(queryBuilder, 2)) {
        // TODO: Delete legacy support, (Component, variables, rql) => rql`...`.
        node = queryBuilder(Component, variables, RelayQL);
      } else if (isDeprecatedCallWithArgCountGreaterThan(queryBuilder, 0)) {
        node = queryBuilder(Component, variables);
      } else {
        node = queryBuilder(Component, variables);
        if (GraphQL.isQuery(node) && node.fragments.length === 0) {
          var rootCall = node.calls[0];
          if (!node.fields.every(field => field.fields.length === 0)) {
            invariant(
              false,
              'Relay.QL: Expected query `%s` to be empty. For example, use ' +
              '`node(id: $id)`, not `node(id: $id) { ... }`.',
              rootCall.name
            );
          }
          node = new GraphQL.Query(
            rootCall.name,
            rootCall.value,
            node.fields,
            [fragmentReference],
            node.metadata,
            node.name
          );
        }
      }
      componentCache.set(Component, node);
    }
    if (node) {
      return GraphQL.isQuery(node) ? node : undefined;
    }
    return null;
  },
};

function toVariables(variableNames: VariableNames): {
  [key: string]: GraphQL.CallVariable;
} {
  var variables = {};
  variableNames.forEach(name => {
    variables[name] = new GraphQL.CallVariable(name);
  });
  return variables;
}

module.exports = buildRQL;
