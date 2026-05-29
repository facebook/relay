/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<b7b0a1e327bb9e11d80a3726c54ccebb>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment, RefetchableFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RefetchableClientEdgeQuery_ResolverGCTestResolverClientEdgeToServerRecursiveQuery_me__client_edge__another_client_edge$fragmentType: FragmentType;
type ClientEdgeQuery_ResolverGCTestResolverClientEdgeToServerRecursiveQuery_me__client_edge__another_client_edge$variables = any;
export type RefetchableClientEdgeQuery_ResolverGCTestResolverClientEdgeToServerRecursiveQuery_me__client_edge__another_client_edge$data = {
  readonly id: string,
  readonly name: ?string,
  readonly $fragmentType: RefetchableClientEdgeQuery_ResolverGCTestResolverClientEdgeToServerRecursiveQuery_me__client_edge__another_client_edge$fragmentType,
};
export type RefetchableClientEdgeQuery_ResolverGCTestResolverClientEdgeToServerRecursiveQuery_me__client_edge__another_client_edge$key = {
  readonly $data?: RefetchableClientEdgeQuery_ResolverGCTestResolverClientEdgeToServerRecursiveQuery_me__client_edge__another_client_edge$data,
  readonly $fragmentSpreads: RefetchableClientEdgeQuery_ResolverGCTestResolverClientEdgeToServerRecursiveQuery_me__client_edge__another_client_edge$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "refetch": {
      "connection": null,
      "fragmentPathInResult": [
        "node"
      ],
      "operation": require('./ClientEdgeQuery_ResolverGCTestResolverClientEdgeToServerRecursiveQuery_me__client_edge__another_client_edge.graphql'),
      "identifierInfo": {
        "identifierField": "id",
        "identifierQueryVariableName": "id"
      }
    }
  },
  "name": "RefetchableClientEdgeQuery_ResolverGCTestResolverClientEdgeToServerRecursiveQuery_me__client_edge__another_client_edge",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
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
};

if (__DEV__) {
  (node/*:: as any*/).hash = "e84993737b8022e99659ef3064e0aeea";
}

module.exports = ((node/*:: as any*/)/*:: as RefetchableFragment<
  RefetchableClientEdgeQuery_ResolverGCTestResolverClientEdgeToServerRecursiveQuery_me__client_edge__another_client_edge$fragmentType,
  RefetchableClientEdgeQuery_ResolverGCTestResolverClientEdgeToServerRecursiveQuery_me__client_edge__another_client_edge$data,
  ClientEdgeQuery_ResolverGCTestResolverClientEdgeToServerRecursiveQuery_me__client_edge__another_client_edge$variables,
>*/);
