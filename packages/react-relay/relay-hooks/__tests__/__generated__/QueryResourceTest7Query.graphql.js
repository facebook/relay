/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<48ac33e8d5ff8d8979d680e1e90b67c8>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { QueryResourceTest5Fragment$fragmentType } from "./QueryResourceTest5Fragment.graphql";
export type QueryResourceTest7Query$variables = {|
  id: string,
|};
export type QueryResourceTest7Query$data = {|
  +node: ?{|
    +__typename: string,
    +$fragmentSpreads: QueryResourceTest5Fragment$fragmentType,
  |},
|};
export type QueryResourceTest7Query = {|
  response: QueryResourceTest7Query$data,
  variables: QueryResourceTest7Query$variables,
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
    "name": "QueryResourceTest7Query",
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
            "name": "QueryResourceTest5Fragment"
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
    "name": "QueryResourceTest7Query",
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
                "name": "username",
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
    "cacheID": "16fee9ca0254fe5e0b1fe85b602278b5",
    "id": null,
    "metadata": {},
    "name": "QueryResourceTest7Query",
    "operationKind": "query",
    "text": "query QueryResourceTest7Query(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...QueryResourceTest5Fragment\n    id\n  }\n}\n\nfragment QueryResourceTest5Fragment on User {\n  id\n  username\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "256baee2dce2b172d5cf955589c1ab8f";
}

module.exports = ((node/*: any*/)/*: Query<
  QueryResourceTest7Query$variables,
  QueryResourceTest7Query$data,
>*/);
