/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<397cf4ed066999cfe51071e3034cfe59>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type FragmentResourceTest4Fragment$fragmentType = any;
export type FragmentResourceTest4Query$variables = {|
  id: string,
|};
export type FragmentResourceTest4Query$data = {|
  +$fragmentSpreads: FragmentResourceTest4Fragment$fragmentType,
|};
export type FragmentResourceTest4Query = {|
  response: FragmentResourceTest4Query$data,
  variables: FragmentResourceTest4Query$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "FragmentResourceTest4Query",
    "selections": [
      {
        "args": null,
        "kind": "FragmentSpread",
        "name": "FragmentResourceTest4Fragment"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "FragmentResourceTest4Query",
    "selections": [
      {
        "alias": null,
        "args": [
          {
            "kind": "Variable",
            "name": "id",
            "variableName": "id"
          }
        ],
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
    "cacheID": "9133131de55f817c79e31e41f9d6cf79",
    "id": null,
    "metadata": {},
    "name": "FragmentResourceTest4Query",
    "operationKind": "query",
    "text": "query FragmentResourceTest4Query(\n  $id: ID!\n) {\n  ...FragmentResourceTest4Fragment\n}\n\nfragment FragmentResourceTest4Fragment on Query {\n  node(id: $id) {\n    __typename\n    id\n    name\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "d8eb85a11fd17ca4b97b9b170e2184db";
}

module.exports = ((node/*: any*/)/*: Query<
  FragmentResourceTest4Query$variables,
  FragmentResourceTest4Query$data,
>*/);
