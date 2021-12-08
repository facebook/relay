/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<7a861c0ee2164dd1ffc249630b64e1a5>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayModernEnvironmentExecuteSubscriptionTestCommentFragment$fragmentType = any;
export type RelayModernEnvironmentExecuteSubscriptionTestCommentQuery$variables = {|
  id: string,
|};
export type RelayModernEnvironmentExecuteSubscriptionTestCommentQueryVariables = RelayModernEnvironmentExecuteSubscriptionTestCommentQuery$variables;
export type RelayModernEnvironmentExecuteSubscriptionTestCommentQuery$data = {|
  +node: ?{|
    +id: string,
    +$fragmentSpreads: RelayModernEnvironmentExecuteSubscriptionTestCommentFragment$fragmentType,
  |},
|};
export type RelayModernEnvironmentExecuteSubscriptionTestCommentQueryResponse = RelayModernEnvironmentExecuteSubscriptionTestCommentQuery$data;
export type RelayModernEnvironmentExecuteSubscriptionTestCommentQuery = {|
  variables: RelayModernEnvironmentExecuteSubscriptionTestCommentQueryVariables,
  response: RelayModernEnvironmentExecuteSubscriptionTestCommentQuery$data,
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
    "name": "RelayModernEnvironmentExecuteSubscriptionTestCommentQuery",
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
            "name": "RelayModernEnvironmentExecuteSubscriptionTestCommentFragment"
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
    "name": "RelayModernEnvironmentExecuteSubscriptionTestCommentQuery",
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
    "cacheID": "978b047c3b421f2d91ad8ca05476a456",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentExecuteSubscriptionTestCommentQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentExecuteSubscriptionTestCommentQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    id\n    ...RelayModernEnvironmentExecuteSubscriptionTestCommentFragment\n  }\n}\n\nfragment RelayModernEnvironmentExecuteSubscriptionTestCommentFragment on Comment {\n  id\n  body {\n    text\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "19ec2bd10802d7b3486c8eacf7bc0e37";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentExecuteSubscriptionTestCommentQuery$variables,
  RelayModernEnvironmentExecuteSubscriptionTestCommentQuery$data,
>*/);
