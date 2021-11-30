/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<180b5933187bf8c63121b3adb8cf00a3>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayModernStoreTest6Fragment$fragmentType = any;
export type RelayModernStoreTest5Query$variables = {|
  size?: ?$ReadOnlyArray<?number>,
|};
export type RelayModernStoreTest5QueryVariables = RelayModernStoreTest5Query$variables;
export type RelayModernStoreTest5Query$data = {|
  +me: ?{|
    +$fragmentSpreads: RelayModernStoreTest6Fragment$fragmentType,
  |},
|};
export type RelayModernStoreTest5QueryResponse = RelayModernStoreTest5Query$data;
export type RelayModernStoreTest5Query = {|
  variables: RelayModernStoreTest5QueryVariables,
  response: RelayModernStoreTest5Query$data,
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
    "name": "RelayModernStoreTest5Query",
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
            "name": "RelayModernStoreTest6Fragment"
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
    "name": "RelayModernStoreTest5Query",
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
    "cacheID": "e0484b98b6b6fe54f6cf3f2e897f098f",
    "id": null,
    "metadata": {},
    "name": "RelayModernStoreTest5Query",
    "operationKind": "query",
    "text": "query RelayModernStoreTest5Query(\n  $size: [Int]\n) {\n  me {\n    ...RelayModernStoreTest6Fragment\n    id\n  }\n}\n\nfragment RelayModernStoreTest6Fragment on User {\n  name\n  profilePicture(size: $size) {\n    uri\n  }\n  emailAddresses\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "947477a0d26945cfdd5000605f8edc07";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernStoreTest5Query$variables,
  RelayModernStoreTest5Query$data,
>*/);
