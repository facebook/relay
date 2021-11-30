/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<6a14df3ecb3fef6fce58e31fb7334668>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type FragmentResourceTest3Fragment$fragmentType = any;
export type FragmentResourceTest3Query$variables = {|
  ids: $ReadOnlyArray<string>,
|};
export type FragmentResourceTest3QueryVariables = FragmentResourceTest3Query$variables;
export type FragmentResourceTest3Query$data = {|
  +nodes: ?$ReadOnlyArray<?{|
    +__typename: string,
    +$fragmentSpreads: FragmentResourceTest3Fragment$fragmentType,
  |}>,
|};
export type FragmentResourceTest3QueryResponse = FragmentResourceTest3Query$data;
export type FragmentResourceTest3Query = {|
  variables: FragmentResourceTest3QueryVariables,
  response: FragmentResourceTest3Query$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "ids"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "ids",
    "variableName": "ids"
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
    "name": "FragmentResourceTest3Query",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "nodes",
        "plural": true,
        "selections": [
          (v2/*: any*/),
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "FragmentResourceTest3Fragment"
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
    "name": "FragmentResourceTest3Query",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "nodes",
        "plural": true,
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
    "cacheID": "0ce0e810c62fd81e45ee2f8c1c339aa4",
    "id": null,
    "metadata": {},
    "name": "FragmentResourceTest3Query",
    "operationKind": "query",
    "text": "query FragmentResourceTest3Query(\n  $ids: [ID!]!\n) {\n  nodes(ids: $ids) {\n    __typename\n    ...FragmentResourceTest3Fragment\n    id\n  }\n}\n\nfragment FragmentResourceTest3Fragment on User {\n  id\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "67df29b7be6197595574afc5bad335bb";
}

module.exports = ((node/*: any*/)/*: Query<
  FragmentResourceTest3Query$variables,
  FragmentResourceTest3Query$data,
>*/);
