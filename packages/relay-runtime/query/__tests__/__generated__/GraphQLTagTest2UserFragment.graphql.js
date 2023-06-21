/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<e5d747e7aa05f28e5d950589cbec6c0c>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment, RefetchableFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type GraphQLTagTest2UserFragment$fragmentType: FragmentType;
type GraphQLTagTestUserFragment1RefetchQuery$variables = any;
export type GraphQLTagTest2UserFragment$data = {|
  +id: string,
  +name: ?string,
  +$fragmentType: GraphQLTagTest2UserFragment$fragmentType,
|};
export type GraphQLTagTest2UserFragment$key = {
  +$data?: GraphQLTagTest2UserFragment$data,
  +$fragmentSpreads: GraphQLTagTest2UserFragment$fragmentType,
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
      "identifierInfo": {
        "identifierField": "id",
        "identifierQueryVariableName": "id"
      }
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

module.exports = ((node/*: any*/)/*: RefetchableFragment<
  GraphQLTagTest2UserFragment$fragmentType,
  GraphQLTagTest2UserFragment$data,
  GraphQLTagTestUserFragment1RefetchQuery$variables,
>*/);
