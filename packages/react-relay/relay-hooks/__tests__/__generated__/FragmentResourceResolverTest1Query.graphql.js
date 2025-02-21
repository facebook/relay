/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<92f8ffd1c3c7db7f5dfbe80710eee93f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { FragmentResourceClientEdgesTestFragment1$fragmentType } from "./FragmentResourceClientEdgesTestFragment1.graphql";
export type FragmentResourceResolverTest1Query$variables = {|
  id: string,
|};
export type FragmentResourceResolverTest1Query$data = {|
  +node: ?{|
    +__typename: string,
    +$fragmentSpreads: FragmentResourceClientEdgesTestFragment1$fragmentType,
  |},
|};
export type FragmentResourceResolverTest1Query = {|
  response: FragmentResourceResolverTest1Query$data,
  variables: FragmentResourceResolverTest1Query$variables,
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
  "name": "__typename",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "FragmentResourceResolverTest1Query",
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
            "name": "FragmentResourceClientEdgesTestFragment1"
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
    "name": "FragmentResourceResolverTest1Query",
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
            "kind": "InlineFragment",
            "selections": [
              {
                "name": "client_edge",
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
                "isOutputType": false
              }
            ],
            "type": "User",
            "abstractKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "046cad0426503110790cbbc84a64eb1e",
    "id": null,
    "metadata": {},
    "name": "FragmentResourceResolverTest1Query",
    "operationKind": "query",
    "text": "query FragmentResourceResolverTest1Query(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...FragmentResourceClientEdgesTestFragment1\n    id\n  }\n}\n\nfragment FragmentResourceClientEdgesTestFragment1 on User {\n  ...UserClientEdgeResolver\n}\n\nfragment UserClientEdgeResolver on User {\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "8255413a07b7c7f7caeb7dd17db86835";
}

module.exports = ((node/*: any*/)/*: Query<
  FragmentResourceResolverTest1Query$variables,
  FragmentResourceResolverTest1Query$data,
>*/);
