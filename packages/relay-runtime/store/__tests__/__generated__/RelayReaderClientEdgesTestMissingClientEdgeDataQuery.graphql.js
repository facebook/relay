/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<9a0067afd8f121e1038cba917258708e>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { UserReadsClientEdgeResolver$key } from "./../resolvers/__generated__/UserReadsClientEdgeResolver.graphql";
import {reads_client_edge as userReadsClientEdgeResolverType} from "../resolvers/UserReadsClientEdgeResolver.js";
// Type assertion validating that `userReadsClientEdgeResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(userReadsClientEdgeResolverType: (
  rootKey: UserReadsClientEdgeResolver$key,
) => ?mixed);
export type RelayReaderClientEdgesTestMissingClientEdgeDataQuery$variables = {||};
export type RelayReaderClientEdgesTestMissingClientEdgeDataQuery$data = {|
  +me: ?{|
    +reads_client_edge: ?ReturnType<typeof userReadsClientEdgeResolverType>,
  |},
|};
export type RelayReaderClientEdgesTestMissingClientEdgeDataQuery = {|
  response: RelayReaderClientEdgesTestMissingClientEdgeDataQuery$data,
  variables: RelayReaderClientEdgesTestMissingClientEdgeDataQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderClientEdgesTestMissingClientEdgeDataQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "fragment": {
              "args": null,
              "kind": "FragmentSpread",
              "name": "UserReadsClientEdgeResolver"
            },
            "kind": "RelayResolver",
            "name": "reads_client_edge",
            "resolverModule": require('./../resolvers/UserReadsClientEdgeResolver').reads_client_edge,
            "path": "me.reads_client_edge"
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayReaderClientEdgesTestMissingClientEdgeDataQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          {
            "name": "reads_client_edge",
            "args": null,
            "fragment": {
              "kind": "InlineFragment",
              "selections": [
                {
                  "name": "client_edge",
                  "args": null,
                  "fragment": {
                    "kind": "InlineFragment",
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "name",
                        "storageKey": null
                      }
                    ],
                    "type": "User",
                    "abstractKey": null
                  },
                  "kind": "RelayResolver",
                  "storageKey": null,
                  "isOutputType": false
                }
              ],
              "type": "User",
              "abstractKey": null
            },
            "kind": "RelayResolver",
            "storageKey": null,
            "isOutputType": false
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "1e956bbb955c2a61fbebb8e4b4a6d3a9",
    "id": null,
    "metadata": {},
    "name": "RelayReaderClientEdgesTestMissingClientEdgeDataQuery",
    "operationKind": "query",
    "text": "query RelayReaderClientEdgesTestMissingClientEdgeDataQuery {\n  me {\n    ...UserReadsClientEdgeResolver\n    id\n  }\n}\n\nfragment UserClientEdgeResolver on User {\n  name\n}\n\nfragment UserReadsClientEdgeResolver on User {\n  ...UserClientEdgeResolver\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "1ded8560a2e31ffeb0290644418eaed3";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderClientEdgesTestMissingClientEdgeDataQuery$variables,
  RelayReaderClientEdgesTestMissingClientEdgeDataQuery$data,
>*/);
