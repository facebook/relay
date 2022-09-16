/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<5cb45ccc3a8ad0d6f4eea43b70f4282f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
import type { GraphQLTagTest5UserFragment$fragmentType } from "./GraphQLTagTest5UserFragment.graphql";
export type GraphQLTagTestUserFragment3RefetchQuery$variables = {|
  id: string,
|};
export type GraphQLTagTestUserFragment3RefetchQuery$data = {|
  +node: ?{|
    +$fragmentSpreads: GraphQLTagTest5UserFragment$fragmentType,
  |},
|};
export type GraphQLTagTestUserFragment3RefetchQuery = {|
  response: GraphQLTagTestUserFragment3RefetchQuery$data,
  variables: GraphQLTagTestUserFragment3RefetchQuery$variables,
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
    "name": "GraphQLTagTestUserFragment3RefetchQuery",
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
            "name": "GraphQLTagTest5UserFragment"
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
    "name": "GraphQLTagTestUserFragment3RefetchQuery",
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
    "cacheID": "07f563d0b94fea686c8d4d4c2c7aa958",
    "id": null,
    "metadata": {},
    "name": "GraphQLTagTestUserFragment3RefetchQuery",
    "operationKind": "query",
    "text": "query GraphQLTagTestUserFragment3RefetchQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...GraphQLTagTest5UserFragment\n    id\n  }\n}\n\nfragment GraphQLTagTest5UserFragment on User {\n  id\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "8c6f16917d7019fa1e958f35d43ef8f5";
}

module.exports = ((node/*: any*/)/*: Query<
  GraphQLTagTestUserFragment3RefetchQuery$variables,
  GraphQLTagTestUserFragment3RefetchQuery$data,
>*/);
