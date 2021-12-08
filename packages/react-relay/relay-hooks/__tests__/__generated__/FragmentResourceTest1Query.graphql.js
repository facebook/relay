/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<1571308bda34dfb925919d5dcd9c4af1>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type FragmentResourceTest1Fragment$fragmentType = any;
export type FragmentResourceTest1Query$variables = {|
  id: string,
|};
export type FragmentResourceTest1QueryVariables = FragmentResourceTest1Query$variables;
export type FragmentResourceTest1Query$data = {|
  +node: ?{|
    +__typename: string,
    +$fragmentSpreads: FragmentResourceTest1Fragment$fragmentType,
  |},
|};
export type FragmentResourceTest1QueryResponse = FragmentResourceTest1Query$data;
export type FragmentResourceTest1Query = {|
  variables: FragmentResourceTest1QueryVariables,
  response: FragmentResourceTest1Query$data,
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
  (node/*: any*/).hash = "bf5cd6051d37288b658f3312de8c527a";
}

module.exports = ((node/*: any*/)/*: Query<
  FragmentResourceTest1Query$variables,
  FragmentResourceTest1Query$data,
>*/);
