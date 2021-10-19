/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<fd6ad4a532cc5a25d6f5b25e6a4589cc>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
type GraphQLTagTest5UserFragment$ref = any;
type GraphQLTagTest5UserFragment$fragmentType = any;
export type { GraphQLTagTest5UserFragment$ref, GraphQLTagTest5UserFragment$fragmentType };
export type GraphQLTagTest5UserFragment = {|
  +id: string,
  +name: ?string,
  +$refType: GraphQLTagTest5UserFragment$ref,
|};
export type GraphQLTagTest5UserFragment$data = GraphQLTagTest5UserFragment;
export type GraphQLTagTest5UserFragment$key = {
  +$data?: GraphQLTagTest5UserFragment$data,
  +$fragmentRefs: GraphQLTagTest5UserFragment$ref,
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
      "operation": require('./GraphQLTagTestUserFragment3RefetchQuery.graphql'),
      "identifierField": "id"
    }
  },
  "name": "GraphQLTagTest5UserFragment",
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
  (node/*: any*/).hash = "8c6f16917d7019fa1e958f35d43ef8f5";
}

module.exports = node;
