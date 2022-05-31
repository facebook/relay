/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<50749e2bfd33735b6b7a6e8be68a9a6a>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RefetchableClientEdgeQuery_RelayReaderClientEdgesTest1Query_me__client_edge$fragmentType = any;
export type ClientEdgeQuery_RelayReaderClientEdgesTest1Query_me__client_edge$variables = {|
  id: string,
|};
export type ClientEdgeQuery_RelayReaderClientEdgesTest1Query_me__client_edge$data = {|
  +node: ?{|
    +$fragmentSpreads: RefetchableClientEdgeQuery_RelayReaderClientEdgesTest1Query_me__client_edge$fragmentType,
  |},
|};
export type ClientEdgeQuery_RelayReaderClientEdgesTest1Query_me__client_edge = {|
  response: ClientEdgeQuery_RelayReaderClientEdgesTest1Query_me__client_edge$data,
  variables: ClientEdgeQuery_RelayReaderClientEdgesTest1Query_me__client_edge$variables,
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
    "name": "ClientEdgeQuery_RelayReaderClientEdgesTest1Query_me__client_edge",
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
            "name": "RefetchableClientEdgeQuery_RelayReaderClientEdgesTest1Query_me__client_edge"
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
    "name": "ClientEdgeQuery_RelayReaderClientEdgesTest1Query_me__client_edge",
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
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "name",
                "storageKey": null
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
    "cacheID": "e82ee5465ede227da586ce13413a0f78",
    "id": null,
    "metadata": {},
    "name": "ClientEdgeQuery_RelayReaderClientEdgesTest1Query_me__client_edge",
    "operationKind": "query",
    "text": "query ClientEdgeQuery_RelayReaderClientEdgesTest1Query_me__client_edge(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...RefetchableClientEdgeQuery_RelayReaderClientEdgesTest1Query_me__client_edge\n    id\n  }\n}\n\nfragment RefetchableClientEdgeQuery_RelayReaderClientEdgesTest1Query_me__client_edge on User {\n  name\n  id\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "6c1083daaac4ea12e10cc69caf7e3983";
}

module.exports = ((node/*: any*/)/*: Query<
  ClientEdgeQuery_RelayReaderClientEdgesTest1Query_me__client_edge$variables,
  ClientEdgeQuery_RelayReaderClientEdgesTest1Query_me__client_edge$data,
>*/);
