/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<ff0ce9f79896078a2783ce2dee8d47d1>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayModernEnvironmentExecuteSubscriptionWithDeferTestCommentFragment$fragmentType = any;
export type RelayModernEnvironmentExecuteSubscriptionWithDeferTestCommentQuery$variables = {|
  id: string,
|};
export type RelayModernEnvironmentExecuteSubscriptionWithDeferTestCommentQueryVariables = RelayModernEnvironmentExecuteSubscriptionWithDeferTestCommentQuery$variables;
export type RelayModernEnvironmentExecuteSubscriptionWithDeferTestCommentQuery$data = {|
  +node: ?{|
    +id: string,
    +$fragmentSpreads: RelayModernEnvironmentExecuteSubscriptionWithDeferTestCommentFragment$fragmentType,
  |},
|};
export type RelayModernEnvironmentExecuteSubscriptionWithDeferTestCommentQueryResponse = RelayModernEnvironmentExecuteSubscriptionWithDeferTestCommentQuery$data;
export type RelayModernEnvironmentExecuteSubscriptionWithDeferTestCommentQuery = {|
  variables: RelayModernEnvironmentExecuteSubscriptionWithDeferTestCommentQueryVariables,
  response: RelayModernEnvironmentExecuteSubscriptionWithDeferTestCommentQuery$data,
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
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentExecuteSubscriptionWithDeferTestCommentQuery",
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
            "name": "RelayModernEnvironmentExecuteSubscriptionWithDeferTestCommentFragment"
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
    "name": "RelayModernEnvironmentExecuteSubscriptionWithDeferTestCommentQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v3/*: any*/),
          (v2/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "actor",
                "plural": false,
                "selections": [
                  (v3/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "name",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "filters": null,
                    "handle": "name_handler",
                    "key": "",
                    "kind": "ScalarHandle",
                    "name": "name"
                  },
                  (v2/*: any*/)
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
    "cacheID": "05835a436be9824ff4fe4b298a22a494",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentExecuteSubscriptionWithDeferTestCommentQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentExecuteSubscriptionWithDeferTestCommentQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    id\n    ...RelayModernEnvironmentExecuteSubscriptionWithDeferTestCommentFragment\n  }\n}\n\nfragment RelayModernEnvironmentExecuteSubscriptionWithDeferTestCommentFragment on Comment {\n  id\n  actor {\n    __typename\n    name\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "4e3ef6893b11d6b8e50305bb90fa383d";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentExecuteSubscriptionWithDeferTestCommentQuery$variables,
  RelayModernEnvironmentExecuteSubscriptionWithDeferTestCommentQuery$data,
>*/);
