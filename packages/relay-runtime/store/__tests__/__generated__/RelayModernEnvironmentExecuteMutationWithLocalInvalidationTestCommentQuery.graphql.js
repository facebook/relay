/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<0a5999522e6127ab9a1aab5f7468d7bb>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayModernEnvironmentExecuteMutationWithLocalInvalidationTestCommentFragment$fragmentType } from "./RelayModernEnvironmentExecuteMutationWithLocalInvalidationTestCommentFragment.graphql";
export type RelayModernEnvironmentExecuteMutationWithLocalInvalidationTestCommentQuery$variables = {|
  id: string,
|};
export type RelayModernEnvironmentExecuteMutationWithLocalInvalidationTestCommentQuery$data = {|
  +node: ?{|
    +id: string,
    +$fragmentSpreads: RelayModernEnvironmentExecuteMutationWithLocalInvalidationTestCommentFragment$fragmentType,
  |},
|};
export type RelayModernEnvironmentExecuteMutationWithLocalInvalidationTestCommentQuery = {|
  response: RelayModernEnvironmentExecuteMutationWithLocalInvalidationTestCommentQuery$data,
  variables: RelayModernEnvironmentExecuteMutationWithLocalInvalidationTestCommentQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentExecuteMutationWithLocalInvalidationTestCommentQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "RelayModernEnvironmentExecuteMutationWithLocalInvalidationTestCommentFragment"
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RelayModernEnvironmentExecuteMutationWithLocalInvalidationTestCommentQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "__typename",
            "storageKey": null
          },
          (v2/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "Text",
                "kind": "LinkedField",
                "name": "body",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "text",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "type": "Comment",
            "abstractKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "a0ae806eb7424beaf0d9943b8fc3b333",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentExecuteMutationWithLocalInvalidationTestCommentQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentExecuteMutationWithLocalInvalidationTestCommentQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    id\n    ...RelayModernEnvironmentExecuteMutationWithLocalInvalidationTestCommentFragment\n  }\n}\n\nfragment RelayModernEnvironmentExecuteMutationWithLocalInvalidationTestCommentFragment on Comment {\n  id\n  body {\n    text\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "01697c8ccf4980cfb1a655bad4327f7d";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentExecuteMutationWithLocalInvalidationTestCommentQuery$variables,
  RelayModernEnvironmentExecuteMutationWithLocalInvalidationTestCommentQuery$data,
>*/);
