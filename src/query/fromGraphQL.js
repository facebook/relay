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

const RelayQuery = require('RelayQuery');
const RelayMetaRoute = require('RelayMetaRoute');

const invariant = require('invariant');

type ConcreteQueryObject = mixed;
type QueryClass = (
  typeof RelayQuery.Field |
  typeof RelayQuery.Fragment |
  typeof RelayQuery.Operation |
  typeof RelayQuery.Root
);

/**
 * @internal
 *
 * Converts GraphQL nodes to RelayQuery nodes.
 */
var fromGraphQL = {
  Field(query: ConcreteQueryObject): RelayQuery.Field {
    var node = createNode(query, RelayQuery.Field);
    invariant(
      node instanceof RelayQuery.Field,
      'fromGraphQL.Field(): Expected a GraphQL field node.'
    );
    return node;
  },
  Fragment(query: ConcreteQueryObject): RelayQuery.Fragment {
    var node = createNode(query, RelayQuery.Fragment);
    invariant(
      node instanceof RelayQuery.Fragment,
      'fromGraphQL.Field(): Expected a GraphQL fragment node.'
    );
    return node;
  },
  Query(query: ConcreteQueryObject): RelayQuery.Root {
    var node = createNode(query, RelayQuery.Root);
    invariant(
      node instanceof RelayQuery.Root,
      'fromGraphQL.Operation(): Expected a root node.'
    );
    return node;
  },
  Operation(query: ConcreteQueryObject): RelayQuery.Operation {
    var node = createNode(query, RelayQuery.Operation);
    invariant(
      node instanceof RelayQuery.Operation,
      'fromGraphQL.Operation(): Expected a mutation/subscription node.'
    );
    return node;
  },
};

function createNode(
  query: ConcreteQueryObject,
  desiredType: QueryClass
): RelayQuery.Node {
  var variables = {};
  var route = RelayMetaRoute.get('$fromGraphQL');
  return desiredType.create(query, route, variables);
}

module.exports = fromGraphQL;
