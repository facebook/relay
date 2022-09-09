/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<d0361dbea095ed87e4084ac0b8d89789>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { useLazyLoadQueryREACTCACHETest1Fragment$fragmentType } from "./useLazyLoadQueryREACTCACHETest1Fragment.graphql";
export type useLazyLoadQueryREACTCACHETest1Query$variables = {|
  id: string,
|};
export type useLazyLoadQueryREACTCACHETest1Query$data = {|
  +node: ?{|
    +__typename: string,
    +username?: ?string,
    +$fragmentSpreads: useLazyLoadQueryREACTCACHETest1Fragment$fragmentType,
  |},
|};
export type useLazyLoadQueryREACTCACHETest1Query = {|
  response: useLazyLoadQueryREACTCACHETest1Query$data,
  variables: useLazyLoadQueryREACTCACHETest1Query$variables,
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
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "username",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "useLazyLoadQueryREACTCACHETest1Query",
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
            "kind": "InlineFragment",
            "selections": [
              (v3/*: any*/)
            ],
            "type": "User",
            "abstractKey": null
          },
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "useLazyLoadQueryREACTCACHETest1Fragment"
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
    "name": "useLazyLoadQueryREACTCACHETest1Query",
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
            "kind": "InlineFragment",
            "selections": [
              (v3/*: any*/),
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
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "098de982a39032743cd9ad9bc5849426",
    "id": null,
    "metadata": {},
    "name": "useLazyLoadQueryREACTCACHETest1Query",
    "operationKind": "query",
    "text": "query useLazyLoadQueryREACTCACHETest1Query(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ... on User {\n      username\n    }\n    ...useLazyLoadQueryREACTCACHETest1Fragment\n    id\n  }\n}\n\nfragment useLazyLoadQueryREACTCACHETest1Fragment on User {\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "f65d6d0f38c33ef45c2fd0cb1e138dbc";
}

module.exports = ((node/*: any*/)/*: Query<
  useLazyLoadQueryREACTCACHETest1Query$variables,
  useLazyLoadQueryREACTCACHETest1Query$data,
>*/);
