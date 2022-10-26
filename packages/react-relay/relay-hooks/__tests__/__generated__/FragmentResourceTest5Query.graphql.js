/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<b5eb6ed6a06a775bb9b16442d7ea597c>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { FragmentResourceTest5Fragment$fragmentType } from "./FragmentResourceTest5Fragment.graphql";
export type FragmentResourceTest5Query$variables = {|
  id: string,
|};
export type FragmentResourceTest5Query$data = {|
  +$fragmentSpreads: FragmentResourceTest5Fragment$fragmentType,
|};
export type FragmentResourceTest5Query = {|
  response: FragmentResourceTest5Query$data,
  variables: FragmentResourceTest5Query$variables,
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
    "name": "FragmentResourceTest5Query",
    "selections": [
      {
        "args": (v1/*: any*/),
        "kind": "FragmentSpread",
        "name": "FragmentResourceTest5Fragment"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "FragmentResourceTest5Query",
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
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "name",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "6b690dad5272b7783909738948389d7f",
    "id": null,
    "metadata": {},
    "name": "FragmentResourceTest5Query",
    "operationKind": "query",
    "text": "query FragmentResourceTest5Query(\n  $id: ID!\n) {\n  ...FragmentResourceTest5Fragment_1Bmzm5\n}\n\nfragment FragmentResourceTest5Fragment_1Bmzm5 on Query {\n  node(id: $id) {\n    __typename\n    id\n    name\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "be68ee38c8948a00cd84421c4d976d0b";
}

module.exports = ((node/*: any*/)/*: Query<
  FragmentResourceTest5Query$variables,
  FragmentResourceTest5Query$data,
>*/);
