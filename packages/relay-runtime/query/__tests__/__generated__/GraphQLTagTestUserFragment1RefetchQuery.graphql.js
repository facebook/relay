/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<5358afc9dc29cac944142e12b127032a>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
type GraphQLTagTest2UserFragment$fragmentType = any;
export type GraphQLTagTestUserFragment1RefetchQuery$variables = {|
  id: string,
|};
export type GraphQLTagTestUserFragment1RefetchQuery$data = {|
  +node: ?{|
    +$fragmentSpreads: GraphQLTagTest2UserFragment$fragmentType,
  |},
|};
export type GraphQLTagTestUserFragment1RefetchQuery = {|
  response: GraphQLTagTestUserFragment1RefetchQuery$data,
  variables: GraphQLTagTestUserFragment1RefetchQuery$variables,
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
    "name": "GraphQLTagTestUserFragment1RefetchQuery",
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
            "name": "GraphQLTagTest2UserFragment"
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
    "name": "GraphQLTagTestUserFragment1RefetchQuery",
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
    "cacheID": "64d6da76a9fc7db25024c524223ed2b3",
    "id": null,
    "metadata": {},
    "name": "GraphQLTagTestUserFragment1RefetchQuery",
    "operationKind": "query",
    "text": "query GraphQLTagTestUserFragment1RefetchQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...GraphQLTagTest2UserFragment\n    id\n  }\n}\n\nfragment GraphQLTagTest2UserFragment on User {\n  id\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "551532a9e8b3679f63f17f68268f03d2";
}

module.exports = ((node/*: any*/)/*: Query<
  GraphQLTagTestUserFragment1RefetchQuery$variables,
  GraphQLTagTestUserFragment1RefetchQuery$data,
>*/);
