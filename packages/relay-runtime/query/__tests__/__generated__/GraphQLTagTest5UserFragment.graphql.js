/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<aafb456d23722ded35a94fe8b583f7af>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment, RefetchableFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type GraphQLTagTest5UserFragment$fragmentType: FragmentType;
export type GraphQLTagTest5UserFragment$ref = GraphQLTagTest5UserFragment$fragmentType;
type GraphQLTagTestUserFragment3RefetchQuery$variables = any;
export type GraphQLTagTest5UserFragment$data = {|
  +id: string,
  +name: ?string,
  +$fragmentType: GraphQLTagTest5UserFragment$fragmentType,
|};
export type GraphQLTagTest5UserFragment = GraphQLTagTest5UserFragment$data;
export type GraphQLTagTest5UserFragment$key = {
  +$data?: GraphQLTagTest5UserFragment$data,
  +$fragmentSpreads: GraphQLTagTest5UserFragment$fragmentType,
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

module.exports = ((node/*: any*/)/*: RefetchableFragment<
  GraphQLTagTest5UserFragment$fragmentType,
  GraphQLTagTest5UserFragment$data,
  GraphQLTagTestUserFragment3RefetchQuery$variables,
>*/);
