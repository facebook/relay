/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<67309f93a3a5e916d2e1dbf859bf77b8>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayModernStoreTest5Fragment$fragmentType = any;
export type RelayModernStoreTest4Query$variables = {|
  size?: ?$ReadOnlyArray<?number>,
|};
export type RelayModernStoreTest4QueryVariables = RelayModernStoreTest4Query$variables;
export type RelayModernStoreTest4Query$data = {|
  +me: ?{|
    +$fragmentSpreads: RelayModernStoreTest5Fragment$fragmentType,
  |},
|};
export type RelayModernStoreTest4QueryResponse = RelayModernStoreTest4Query$data;
export type RelayModernStoreTest4Query = {|
  variables: RelayModernStoreTest4QueryVariables,
  response: RelayModernStoreTest4Query$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "size"
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernStoreTest4Query",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "RelayModernStoreTest5Fragment"
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
    "name": "RelayModernStoreTest4Query",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
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
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "emailAddresses",
            "storageKey": null
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
    "cacheID": "1baaedeedd7d9457a213348979567add",
    "id": null,
    "metadata": {},
    "name": "RelayModernStoreTest4Query",
    "operationKind": "query",
    "text": "query RelayModernStoreTest4Query(\n  $size: [Int]\n) {\n  me {\n    ...RelayModernStoreTest5Fragment\n    id\n  }\n}\n\nfragment RelayModernStoreTest5Fragment on User {\n  name\n  profilePicture(size: $size) {\n    uri\n  }\n  emailAddresses\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "a27b012919fdb66b461839feecacd931";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernStoreTest4Query$variables,
  RelayModernStoreTest4Query$data,
>*/);
