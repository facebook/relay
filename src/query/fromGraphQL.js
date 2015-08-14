/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule fromGraphQL
 * @flow
 */

'use strict';

import type GraphQL from 'GraphQL';
var RelayQuery = require('RelayQuery');
var RelayMetaRoute = require('RelayMetaRoute');
var RelayProfiler = require('RelayProfiler');

var invariant = require('invariant');

type ConcreteQueryObject = (
  GraphQL.Field |
  GraphQL.Mutation |
  GraphQL.Query |
  GraphQL.QueryFragment |
  GraphQL.QueryWithValues |
  GraphQL.Subscription
);

/**
 * @internal
 *
 * Converts GraphQL nodes to RelayQuery nodes.
 */
var fromGraphQL = {
  Node(query: ConcreteQueryObject): RelayQuery.Node {
    var variables = {};
    var route = RelayMetaRoute.get('$fromGraphQL');
    return RelayQuery.Node.create(query, route, variables);
  },
  Field(query: ConcreteQueryObject): RelayQuery.Field {
    var node = fromGraphQL.Node(query);
    invariant(
      node instanceof RelayQuery.Field,
      'fromGraphQL.Field(): Expected a GraphQL field node.'
    );
    return node;
  },
  Fragment(query: ConcreteQueryObject): RelayQuery.Fragment {
    var node = fromGraphQL.Node(query);
    invariant(
      node instanceof RelayQuery.Fragment,
      'fromGraphQL.Fragment(): Expected a GraphQL fragment node.',
    );
    return node;
  },
  Query(query: ConcreteQueryObject): RelayQuery.Root {
    var node = fromGraphQL.Node(query);
    invariant(
      node instanceof RelayQuery.Root,
      'fromGraphQL.Query(): Expected a GraphQL query root node.',
    );
    return node;
  },
  Operation(query: ConcreteQueryObject): RelayQuery.Operation {
    var node = fromGraphQL.Node(query);
    invariant(
      node instanceof RelayQuery.Operation,
      'fromGraphQL.Operation(): Expected a mutation/subscription node.'
    );
    return node;
  }
};

RelayProfiler.instrumentMethods(fromGraphQL, {
  Node: 'fromGraphQL.Node',
  Field: 'fromGraphQL.Field',
  Fragment: 'fromGraphQL.Fragment',
  Query: 'fromGraphQL.Query'
});

module.exports = fromGraphQL;
