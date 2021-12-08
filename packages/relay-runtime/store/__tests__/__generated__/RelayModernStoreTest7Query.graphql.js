/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<9e35d18d3321ec8233cd6cde8a22a023>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayModernStoreTest8Fragment$fragmentType = any;
export type RelayModernStoreTest7Query$variables = {|
  id: string,
  size?: ?$ReadOnlyArray<?number>,
|};
export type RelayModernStoreTest7QueryVariables = RelayModernStoreTest7Query$variables;
export type RelayModernStoreTest7Query$data = {|
  +node: ?{|
    +$fragmentSpreads: RelayModernStoreTest8Fragment$fragmentType,
  |},
|};
export type RelayModernStoreTest7QueryResponse = RelayModernStoreTest7Query$data;
export type RelayModernStoreTest7Query = {|
  variables: RelayModernStoreTest7QueryVariables,
  response: RelayModernStoreTest7Query$data,
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
    "name": "RelayModernStoreTest7Query",
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
            "name": "RelayModernStoreTest8Fragment"
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
    "name": "RelayModernStoreTest7Query",
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
    "cacheID": "2031a2736d0ca278d01561fb51edc789",
    "id": null,
    "metadata": {},
    "name": "RelayModernStoreTest7Query",
    "operationKind": "query",
    "text": "query RelayModernStoreTest7Query(\n  $id: ID!\n  $size: [Int]\n) {\n  node(id: $id) {\n    __typename\n    ...RelayModernStoreTest8Fragment\n    id\n  }\n}\n\nfragment RelayModernStoreTest8Fragment on User {\n  name\n  profilePicture(size: $size) {\n    uri\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "2bfbf713695a9ce69b8e915e0ec020f4";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernStoreTest7Query$variables,
  RelayModernStoreTest7Query$data,
>*/);
