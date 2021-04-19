/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<48da12ef79e79ae34177495d07933845>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
type MultiActorEnvironmentExecuteMutationTestCommentFragment$ref = any;
export type MultiActorEnvironmentExecuteMutationTestCommentQueryVariables = {|
  id: string,
|};
export type MultiActorEnvironmentExecuteMutationTestCommentQueryResponse = {|
  +node: ?{|
    +id: string,
    +$fragmentRefs: MultiActorEnvironmentExecuteMutationTestCommentFragment$ref,
  |},
|};
export type MultiActorEnvironmentExecuteMutationTestCommentQuery = {|
  variables: MultiActorEnvironmentExecuteMutationTestCommentQueryVariables,
  response: MultiActorEnvironmentExecuteMutationTestCommentQueryResponse,
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
  (node/*: any*/).hash = "dd845fc72f2a9b2b232f69a75bfae3f7";
}

module.exports = node;
