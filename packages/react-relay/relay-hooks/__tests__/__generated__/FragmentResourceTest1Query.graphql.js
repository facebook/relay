/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<55a15f486d0a77f5d41718c1277d9c19>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { FragmentResourceTest1Fragment$fragmentType } from "./FragmentResourceTest1Fragment.graphql";
export type FragmentResourceTest1Query$variables = {|
  id: string,
|};
export type FragmentResourceTest1Query$data = {|
  +node: ?{|
    +__typename: string,
    +$fragmentSpreads: FragmentResourceTest1Fragment$fragmentType,
  |},
|};
export type FragmentResourceTest1Query = {|
  response: FragmentResourceTest1Query$data,
  variables: FragmentResourceTest1Query$variables,
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
    "name": "FragmentResourceTest1Query",
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
            "name": "FragmentResourceTest1Fragment"
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
    "name": "FragmentResourceTest1Query",
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
    "cacheID": "48e294bc84f2997e423eef7275cc0b37",
    "id": null,
    "metadata": {},
    "name": "FragmentResourceTest1Query",
    "operationKind": "query",
    "text": "query FragmentResourceTest1Query(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...FragmentResourceTest1Fragment\n    id\n  }\n}\n\nfragment FragmentResourceTest1Fragment on User {\n  id\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "cc7b893d1f91ada940b65acd486ebdf8";
}

module.exports = ((node/*: any*/)/*: Query<
  FragmentResourceTest1Query$variables,
  FragmentResourceTest1Query$data,
>*/);
