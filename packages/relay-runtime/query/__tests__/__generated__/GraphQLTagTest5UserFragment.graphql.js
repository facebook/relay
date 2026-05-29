/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<6c8c5c81a4e5427c09cf6d97af83c003>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment, RefetchableFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type GraphQLTagTest5UserFragment$fragmentType: FragmentType;
type GraphQLTagTestUserFragment3RefetchQuery$variables = any;
export type GraphQLTagTest5UserFragment$data = {
  readonly id: string,
  readonly name: ?string,
  readonly $fragmentType: GraphQLTagTest5UserFragment$fragmentType,
};
export type GraphQLTagTest5UserFragment$key = {
  readonly $data?: GraphQLTagTest5UserFragment$data,
  readonly $fragmentSpreads: GraphQLTagTest5UserFragment$fragmentType,
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
      "identifierInfo": {
        "identifierField": "id",
        "identifierQueryVariableName": "id"
      }
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
  (node/*:: as any*/).hash = "8c6f16917d7019fa1e958f35d43ef8f5";
}

module.exports = ((node/*:: as any*/)/*:: as RefetchableFragment<
  GraphQLTagTest5UserFragment$fragmentType,
  GraphQLTagTest5UserFragment$data,
  GraphQLTagTestUserFragment3RefetchQuery$variables,
>*/);
