/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule toGraphQL
 * @flow
 */

'use strict';

var GraphQL = require('GraphQL');
var RelayProfiler = require('RelayProfiler');
var RelayQuery = require('RelayQuery');

var invariant = require('invariant');

type GraphQLNode = (
  GraphQL.Field |
  GraphQL.Query |
  GraphQL.QueryFragment
);

/**
 * @internal
 *
 * Converts a RelayQuery.Node into its equivalent GraphQL.Node. This should only
 * be used to aid in iterative migration of Relay to use RelayQuery.
 */
var toGraphQL = {
  Node(node: RelayQuery.Node): GraphQLNode {
    if (node instanceof RelayQuery.Root) {
      return toGraphQL.Query(node);
    } else if (node instanceof RelayQuery.Fragment) {
      return toGraphQL.Fragment(node);
    } else {
      invariant(node instanceof RelayQuery.Field, 'toGraphQL: Invalid node.');
      return toGraphQL.Field(node);
    }
  },
  QueryWithValues(node: RelayQuery.Root): GraphQL.QueryWithValues {
    return new GraphQL.QueryWithValues(toGraphQL.Query(node), {});
  },
  Query(node: RelayQuery.Root): GraphQL.Query {
    return node.getConcreteQueryNode(() => {
      var batchCall = node.getBatchCall();
      var calls;
      if (batchCall) {
        calls = [new GraphQL.BatchCallVariable(
          batchCall.sourceQueryID,
          batchCall.sourceQueryPath
        )];
      } else {
        const identifyingArg = node.getIdentifyingArg();
        calls = (identifyingArg && identifyingArg.value) || null;
      }

      var [fields, fragments] = toGraphQLChildren(node.getChildren());
      var query = new GraphQL.Query(
        node.getFieldName(),
        calls,
        fields,
        fragments,
        toGraphQLMetadata(node),
        node.getName()
      );
      return query;
    });
  },
  Fragment(node: RelayQuery.Fragment): GraphQL.QueryFragment {
    return node.getConcreteQueryNode(() => {
      var [fields, fragments] = toGraphQLChildren(node.getChildren());
      var fragment = new GraphQL.QueryFragment(
        node.getDebugName(),
        node.getType(),
        fields,
        fragments,
        toGraphQLMetadata(node)
      );
      return fragment;
    });
  },
  Field(node: RelayQuery.Field): GraphQL.Field {
    return node.getConcreteQueryNode(() => {
      var metadata = toGraphQLMetadata(node);
      var calls = node.getCallsWithValues().map(call => {
        return new GraphQL.Callv(
          call.name,
          call.value
        );
      });
      var [fields, fragments] = toGraphQLChildren(node.getChildren());
      return new GraphQL.Field(
        node.getSchemaName(),
        fields,
        fragments,
        calls,
        node.__concreteNode__.alias,
        node.__concreteNode__.condition,
        metadata
      );
    });
  },
};

RelayProfiler.instrumentMethods(toGraphQL, {
  Node: 'toGraphQL.Node',
  QueryWithValues: 'toGraphQL.QueryWithValues',
  Query: 'toGraphQL.Query',
  Fragment: 'toGraphQL.Fragment',
  Field: 'toGraphQL.Field',
});

function toGraphQLChildren(
  children: Array<RelayQuery.Node>
): [Array<GraphQL.Field>, Array<GraphQL.QueryFragment>] {
  var fields = [];
  var fragments = [];
  children.forEach(child => {
    if (child instanceof RelayQuery.Field) {
      fields.push(toGraphQL.Field(child));
    } else {
      invariant(
        child instanceof RelayQuery.Fragment,
        'toGraphQL: Invalid child node.'
      );
      fragments.push(toGraphQL.Fragment(child));
    }
  });
  return [fields, fragments];
}

function toGraphQLMetadata(node: RelayQuery.Node): ?Object {
  var metadata = {
    ...node.__concreteNode__.__metadata__,
  };
  if (Object.keys(metadata).length) {
    return metadata;
  }
  return null;
}

module.exports = toGraphQL;
