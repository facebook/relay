/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<913362b6843cb785f7c89ccea96009e1>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { useLazyLoadQueryNodeFastRefreshTestUserFragment$fragmentType } from "./useLazyLoadQueryNodeFastRefreshTestUserFragment.graphql";
export type useLazyLoadQueryNodeFastRefreshTestUserQuery$variables = {|
  id?: ?string,
|};
export type useLazyLoadQueryNodeFastRefreshTestUserQuery$data = {|
  +node: ?{|
    +id: string,
    +name: ?string,
    +$fragmentSpreads: useLazyLoadQueryNodeFastRefreshTestUserFragment$fragmentType,
  |},
|};
export type useLazyLoadQueryNodeFastRefreshTestUserQuery = {|
  response: useLazyLoadQueryNodeFastRefreshTestUserQuery$data,
  variables: useLazyLoadQueryNodeFastRefreshTestUserQuery$variables,
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
  "name": "id",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "useLazyLoadQueryNodeFastRefreshTestUserQuery",
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
          (v3/*: any*/),
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "useLazyLoadQueryNodeFastRefreshTestUserFragment"
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
    "name": "useLazyLoadQueryNodeFastRefreshTestUserQuery",
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
          (v2/*: any*/),
          (v3/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "4a751479553175e96c86f13892c2c180",
    "id": null,
    "metadata": {},
    "name": "useLazyLoadQueryNodeFastRefreshTestUserQuery",
    "operationKind": "query",
    "text": "query useLazyLoadQueryNodeFastRefreshTestUserQuery(\n  $id: ID\n) {\n  node(id: $id) {\n    __typename\n    id\n    name\n    ...useLazyLoadQueryNodeFastRefreshTestUserFragment\n  }\n}\n\nfragment useLazyLoadQueryNodeFastRefreshTestUserFragment on User {\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "ee05f828677e819fb1cfd6cf12c4e4a0";
}

module.exports = ((node/*: any*/)/*: Query<
  useLazyLoadQueryNodeFastRefreshTestUserQuery$variables,
  useLazyLoadQueryNodeFastRefreshTestUserQuery$data,
>*/);
