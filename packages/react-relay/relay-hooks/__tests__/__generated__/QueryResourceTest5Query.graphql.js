/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<4baa57782add3272b9ce912cc50f3270>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { QueryResourceTest3Fragment$fragmentType } from "./QueryResourceTest3Fragment.graphql";
export type QueryResourceTest5Query$variables = {|
  id: string,
|};
export type QueryResourceTest5Query$data = {|
  +node: ?{|
    +__typename: string,
    +$fragmentSpreads: QueryResourceTest3Fragment$fragmentType,
  |},
|};
export type QueryResourceTest5Query = {|
  response: QueryResourceTest5Query$data,
  variables: QueryResourceTest5Query$variables,
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
    "name": "QueryResourceTest5Query",
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
            "name": "QueryResourceTest3Fragment"
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
    "name": "QueryResourceTest5Query",
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
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "4e2691c54095eab202634767f02950b6",
    "id": null,
    "metadata": {},
    "name": "QueryResourceTest5Query",
    "operationKind": "query",
    "text": "query QueryResourceTest5Query(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...QueryResourceTest3Fragment\n    id\n  }\n}\n\nfragment QueryResourceTest3Fragment on User {\n  id\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "1db024536cad50b8dffa9214614b980e";
}

module.exports = ((node/*: any*/)/*: Query<
  QueryResourceTest5Query$variables,
  QueryResourceTest5Query$data,
>*/);
