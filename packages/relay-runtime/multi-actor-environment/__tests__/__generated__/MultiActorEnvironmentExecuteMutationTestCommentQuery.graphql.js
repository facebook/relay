/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<d4c04a6124f07a4a0fdee505c7f0508c>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { MultiActorEnvironmentExecuteMutationTestCommentFragment$fragmentType } from "./MultiActorEnvironmentExecuteMutationTestCommentFragment.graphql";
export type MultiActorEnvironmentExecuteMutationTestCommentQuery$variables = {|
  id: string,
|};
export type MultiActorEnvironmentExecuteMutationTestCommentQuery$data = {|
  +node: ?{|
    +id: string,
    +$fragmentSpreads: MultiActorEnvironmentExecuteMutationTestCommentFragment$fragmentType,
  |},
|};
export type MultiActorEnvironmentExecuteMutationTestCommentQuery = {|
  response: MultiActorEnvironmentExecuteMutationTestCommentQuery$data,
  variables: MultiActorEnvironmentExecuteMutationTestCommentQuery$variables,
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
    "name": "MultiActorEnvironmentExecuteMutationTestCommentQuery",
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
            "name": "MultiActorEnvironmentExecuteMutationTestCommentFragment"
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
    "name": "MultiActorEnvironmentExecuteMutationTestCommentQuery",
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
    "cacheID": "ea1528382bf5a51c8f2e22d229bcf7df",
    "id": null,
    "metadata": {},
    "name": "MultiActorEnvironmentExecuteMutationTestCommentQuery",
    "operationKind": "query",
    "text": "query MultiActorEnvironmentExecuteMutationTestCommentQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    id\n    ...MultiActorEnvironmentExecuteMutationTestCommentFragment\n  }\n}\n\nfragment MultiActorEnvironmentExecuteMutationTestCommentFragment on Comment {\n  id\n  body {\n    text\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "40c037e72d602053337597c799fb840d";
}

module.exports = ((node/*: any*/)/*: Query<
  MultiActorEnvironmentExecuteMutationTestCommentQuery$variables,
  MultiActorEnvironmentExecuteMutationTestCommentQuery$data,
>*/);
