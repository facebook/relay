/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<cb3ecb366d7cea72ab19183c977a1b5d>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { useLazyLoadQueryNodeActivityTestUserFragment$fragmentType } from "./useLazyLoadQueryNodeActivityTestUserFragment.graphql";
export type useLazyLoadQueryNodeActivityTestUserQuery$variables = {|
  id?: ?string,
|};
export type useLazyLoadQueryNodeActivityTestUserQuery$data = {|
  +node: ?{|
    +id: string,
    +name: ?string,
    +$fragmentSpreads: useLazyLoadQueryNodeActivityTestUserFragment$fragmentType,
  |},
|};
export type useLazyLoadQueryNodeActivityTestUserQuery = {|
  response: useLazyLoadQueryNodeActivityTestUserQuery$data,
  variables: useLazyLoadQueryNodeActivityTestUserQuery$variables,
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
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "useLazyLoadQueryNodeActivityTestUserQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v2/*:: as any*/),
          (v3/*:: as any*/),
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "useLazyLoadQueryNodeActivityTestUserFragment"
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
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "useLazyLoadQueryNodeActivityTestUserQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
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
          (v2/*:: as any*/),
          (v3/*:: as any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "ca1a20e683de10618453afa402046f38",
    "id": null,
    "metadata": {},
    "name": "useLazyLoadQueryNodeActivityTestUserQuery",
    "operationKind": "query",
    "text": "query useLazyLoadQueryNodeActivityTestUserQuery(\n  $id: ID\n) {\n  node(id: $id) {\n    __typename\n    id\n    name\n    ...useLazyLoadQueryNodeActivityTestUserFragment\n  }\n}\n\nfragment useLazyLoadQueryNodeActivityTestUserFragment on User {\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "666cde58381d36fc1cad522b6da4cbb7";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  useLazyLoadQueryNodeActivityTestUserQuery$variables,
  useLazyLoadQueryNodeActivityTestUserQuery$data,
>*/);
