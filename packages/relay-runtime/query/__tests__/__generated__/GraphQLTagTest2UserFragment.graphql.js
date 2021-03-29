/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<8ba4424eabb05bc449738e42a7b88dd2>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
type GraphQLTagTest2UserFragment$ref = any;
type GraphQLTagTest2UserFragment$fragmentType = any;
export type { GraphQLTagTest2UserFragment$ref, GraphQLTagTest2UserFragment$fragmentType };
export type GraphQLTagTest2UserFragment = {|
  +id: string,
  +name: ?string,
  +$refType: GraphQLTagTest2UserFragment$ref,
|};
export type GraphQLTagTest2UserFragment$data = GraphQLTagTest2UserFragment;
export type GraphQLTagTest2UserFragment$key = {
  +$data?: GraphQLTagTest2UserFragment$data,
  +$fragmentRefs: GraphQLTagTest2UserFragment$ref,
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
      "operation": require('./GraphQLTagTestUserFragment1RefetchQuery.graphql'),
      "identifierField": "id"
    }
  },
  "name": "GraphQLTagTest2UserFragment",
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
  (node/*: any*/).hash = "551532a9e8b3679f63f17f68268f03d2";
}

module.exports = node;
