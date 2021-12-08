/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<1746e7631b3d2f11d0d4290bf8c0d6c8>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayModernEnvironmentExecuteMutationWithGlobalInvalidationTestCommentFragment$fragmentType = any;
export type RelayModernEnvironmentExecuteMutationWithGlobalInvalidationTestCommentQuery$variables = {|
  id: string,
|};
export type RelayModernEnvironmentExecuteMutationWithGlobalInvalidationTestCommentQueryVariables = RelayModernEnvironmentExecuteMutationWithGlobalInvalidationTestCommentQuery$variables;
export type RelayModernEnvironmentExecuteMutationWithGlobalInvalidationTestCommentQuery$data = {|
  +node: ?{|
    +id: string,
    +$fragmentSpreads: RelayModernEnvironmentExecuteMutationWithGlobalInvalidationTestCommentFragment$fragmentType,
  |},
|};
export type RelayModernEnvironmentExecuteMutationWithGlobalInvalidationTestCommentQueryResponse = RelayModernEnvironmentExecuteMutationWithGlobalInvalidationTestCommentQuery$data;
export type RelayModernEnvironmentExecuteMutationWithGlobalInvalidationTestCommentQuery = {|
  variables: RelayModernEnvironmentExecuteMutationWithGlobalInvalidationTestCommentQueryVariables,
  response: RelayModernEnvironmentExecuteMutationWithGlobalInvalidationTestCommentQuery$data,
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
    "name": "RelayModernEnvironmentExecuteMutationWithGlobalInvalidationTestCommentQuery",
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
            "name": "RelayModernEnvironmentExecuteMutationWithGlobalInvalidationTestCommentFragment"
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
    "name": "RelayModernEnvironmentExecuteMutationWithGlobalInvalidationTestCommentQuery",
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
    "cacheID": "c82d7b4cfff6cf9aecdbdfa002848887",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentExecuteMutationWithGlobalInvalidationTestCommentQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentExecuteMutationWithGlobalInvalidationTestCommentQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    id\n    ...RelayModernEnvironmentExecuteMutationWithGlobalInvalidationTestCommentFragment\n  }\n}\n\nfragment RelayModernEnvironmentExecuteMutationWithGlobalInvalidationTestCommentFragment on Comment {\n  id\n  body {\n    text\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "7f5195e44dbcc52111a870ea10a689a9";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentExecuteMutationWithGlobalInvalidationTestCommentQuery$variables,
  RelayModernEnvironmentExecuteMutationWithGlobalInvalidationTestCommentQuery$data,
>*/);
