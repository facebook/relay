/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

const RelayMetaRoute = require('../route/RelayMetaRoute');
const RelayQuery = require('./RelayQuery');

const invariant = require('invariant');

type ConcreteQueryObject = mixed;
type QueryClass =
  | typeof RelayQuery.Field
  | typeof RelayQuery.Fragment
  | typeof RelayQuery.Operation
  | typeof RelayQuery.Root;

/**
 * @internal
 *
 * Converts GraphQL nodes to RelayQuery nodes.
 */
const fromGraphQL = {
  Field(query: ConcreteQueryObject): RelayQuery.Field {
    const node = createNode(query, RelayQuery.Field);
    invariant(
      node instanceof RelayQuery.Field,
      'fromGraphQL.Field(): Expected a GraphQL field node.',
    );
    return node;
  },
  Fragment(query: ConcreteQueryObject): RelayQuery.Fragment {
    const node = createNode(query, RelayQuery.Fragment);
    invariant(
      node instanceof RelayQuery.Fragment,
      'fromGraphQL.Fragment(): Expected a GraphQL fragment node.',
    );
    return node;
  },
  Query(query: ConcreteQueryObject): RelayQuery.Root {
    const node = createNode(query, RelayQuery.Root);
    invariant(
      node instanceof RelayQuery.Root,
      'fromGraphQL.Query(): Expected a root node.',
    );
    return node;
  },
  Operation(query: ConcreteQueryObject): RelayQuery.Operation {
    const node = createNode(query, RelayQuery.Operation);
    invariant(
      node instanceof RelayQuery.Operation,
      'fromGraphQL.Operation(): Expected a mutation/subscription node.',
    );
    return node;
  },
};

function createNode(
  query: ConcreteQueryObject,
  desiredType: QueryClass,
): RelayQuery.Node {
  const variables = {};
  const route = RelayMetaRoute.get('$fromGraphQL');
  return desiredType.create(query, route, variables);
}

module.exports = fromGraphQL;
