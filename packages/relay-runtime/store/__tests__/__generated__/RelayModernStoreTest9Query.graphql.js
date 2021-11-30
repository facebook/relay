/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<84d5d7683aa6683803f1ca8ac5f77cfc>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayModernStoreTest9Fragment$fragmentType = any;
export type RelayModernStoreTest9Query$variables = {|
  id: string,
  size?: ?$ReadOnlyArray<?number>,
|};
export type RelayModernStoreTest9QueryVariables = RelayModernStoreTest9Query$variables;
export type RelayModernStoreTest9Query$data = {|
  +node: ?{|
    +$fragmentSpreads: RelayModernStoreTest9Fragment$fragmentType,
  |},
|};
export type RelayModernStoreTest9QueryResponse = RelayModernStoreTest9Query$data;
export type RelayModernStoreTest9Query = {|
  variables: RelayModernStoreTest9QueryVariables,
  response: RelayModernStoreTest9Query$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "size"
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
    "name": "RelayModernStoreTest9Query",
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
            "args": null,
            "kind": "FragmentSpread",
            "name": "RelayModernStoreTest9Fragment"
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
    "name": "RelayModernStoreTest9Query",
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
              },
              {
                "alias": null,
                "args": [
                  {
                    "kind": "Variable",
                    "name": "size",
                    "variableName": "size"
                  }
                ],
                "concreteType": "Image",
                "kind": "LinkedField",
                "name": "profilePicture",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "uri",
                    "storageKey": null
                  }
                ],
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
    "cacheID": "32f4f626a3bc9e5456fa04fb85264e75",
    "id": null,
    "metadata": {},
    "name": "RelayModernStoreTest9Query",
    "operationKind": "query",
    "text": "query RelayModernStoreTest9Query(\n  $id: ID!\n  $size: [Int]\n) {\n  node(id: $id) {\n    __typename\n    ...RelayModernStoreTest9Fragment\n    id\n  }\n}\n\nfragment RelayModernStoreTest9Fragment on User {\n  name\n  profilePicture(size: $size) {\n    uri\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "7ae41adfd80d75a8e28e02f6df5baf47";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernStoreTest9Query$variables,
  RelayModernStoreTest9Query$data,
>*/);
