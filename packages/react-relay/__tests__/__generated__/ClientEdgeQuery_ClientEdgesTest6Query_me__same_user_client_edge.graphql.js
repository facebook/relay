/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<366f4676acbcbb62dabdb15fc6a1e6c9>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RefetchableClientEdgeQuery_ClientEdgesTest6Query_me__same_user_client_edge$fragmentType } from "./RefetchableClientEdgeQuery_ClientEdgesTest6Query_me__same_user_client_edge.graphql";
export type ClientEdgeQuery_ClientEdgesTest6Query_me__same_user_client_edge$variables = {|
  id: string,
|};
export type ClientEdgeQuery_ClientEdgesTest6Query_me__same_user_client_edge$data = {|
  +node: ?{|
    +$fragmentSpreads: RefetchableClientEdgeQuery_ClientEdgesTest6Query_me__same_user_client_edge$fragmentType,
  |},
|};
export type ClientEdgeQuery_ClientEdgesTest6Query_me__same_user_client_edge = {|
  response: ClientEdgeQuery_ClientEdgesTest6Query_me__same_user_client_edge$data,
  variables: ClientEdgeQuery_ClientEdgesTest6Query_me__same_user_client_edge$variables,
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
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ClientEdgeQuery_ClientEdgesTest6Query_me__same_user_client_edge",
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
            "args": null,
            "kind": "FragmentSpread",
            "name": "RefetchableClientEdgeQuery_ClientEdgesTest6Query_me__same_user_client_edge"
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
    "name": "ClientEdgeQuery_ClientEdgesTest6Query_me__same_user_client_edge",
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
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "name": "upper_name",
                "args": null,
                "fragment": {
                  "kind": "InlineFragment",
                  "selections": [
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
                },
                "kind": "RelayResolver",
                "storageKey": null,
                "isOutputType": true
              }
            ],
            "type": "User",
            "abstractKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "4b0b7798dd0bfc7d7ff2e24c459cdccc",
    "id": null,
    "metadata": {},
    "name": "ClientEdgeQuery_ClientEdgesTest6Query_me__same_user_client_edge",
    "operationKind": "query",
    "text": "query ClientEdgeQuery_ClientEdgesTest6Query_me__same_user_client_edge(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...RefetchableClientEdgeQuery_ClientEdgesTest6Query_me__same_user_client_edge\n    id\n  }\n}\n\nfragment ClientEdgesTestUpperName on User {\n  name\n}\n\nfragment RefetchableClientEdgeQuery_ClientEdgesTest6Query_me__same_user_client_edge on User {\n  ...ClientEdgesTestUpperName\n  id\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "330a0878ce30575d8c36e2fdd626c833";
}

module.exports = ((node/*: any*/)/*: Query<
  ClientEdgeQuery_ClientEdgesTest6Query_me__same_user_client_edge$variables,
  ClientEdgeQuery_ClientEdgesTest6Query_me__same_user_client_edge$data,
>*/);
