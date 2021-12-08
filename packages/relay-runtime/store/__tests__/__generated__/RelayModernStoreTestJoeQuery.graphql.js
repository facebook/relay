/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<b82588be16b26a26589e1cb8ab979d1e>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayModernStoreTestJoeFragment$fragmentType = any;
export type RelayModernStoreTestJoeQuery$variables = {|
  id: string,
|};
export type RelayModernStoreTestJoeQueryVariables = RelayModernStoreTestJoeQuery$variables;
export type RelayModernStoreTestJoeQuery$data = {|
  +$fragmentSpreads: RelayModernStoreTestJoeFragment$fragmentType,
|};
export type RelayModernStoreTestJoeQueryResponse = RelayModernStoreTestJoeQuery$data;
export type RelayModernStoreTestJoeQuery = {|
  variables: RelayModernStoreTestJoeQueryVariables,
  response: RelayModernStoreTestJoeQuery$data,
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
    "name": "RelayModernStoreTestJoeQuery",
    "selections": [
      {
        "args": (v1/*: any*/),
        "kind": "FragmentSpread",
        "name": "RelayModernStoreTestJoeFragment"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RelayModernStoreTestJoeQuery",
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
    "cacheID": "8509ae83a2efd900e0e0678f471714b9",
    "id": null,
    "metadata": {},
    "name": "RelayModernStoreTestJoeQuery",
    "operationKind": "query",
    "text": "query RelayModernStoreTestJoeQuery(\n  $id: ID!\n) {\n  ...RelayModernStoreTestJoeFragment_1Bmzm5\n}\n\nfragment RelayModernStoreTestJoeFragment_1Bmzm5 on Query {\n  node(id: $id) {\n    __typename\n    ... on User {\n      name\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "c01ec983d8c9bd25479b7ee0f87a097f";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernStoreTestJoeQuery$variables,
  RelayModernStoreTestJoeQuery$data,
>*/);
