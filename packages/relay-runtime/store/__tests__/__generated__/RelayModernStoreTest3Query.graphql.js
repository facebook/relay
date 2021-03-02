/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<3bd3522bca44088c1f2d0f77d95bf0b1>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
type RelayModernStoreTest3Fragment$ref = any;
export type RelayModernStoreTest3QueryVariables = {|
  size: number,
|};
export type RelayModernStoreTest3QueryResponse = {|
  +me: ?{|
    +$fragmentRefs: RelayModernStoreTest3Fragment$ref,
  |},
|};
export type RelayModernStoreTest3Query = {|
  variables: RelayModernStoreTest3QueryVariables,
  response: RelayModernStoreTest3QueryResponse,
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
    "name": "RelayModernStoreTest3Query",
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
            "name": "RelayModernStoreTest3Fragment"
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
    "name": "RelayModernStoreTest3Query",
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
            "name": "username",
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
    "cacheID": "d3a4c2377ffba48bcca3be0bb3d1c202",
    "id": null,
    "metadata": {},
    "name": "RelayModernStoreTest3Query",
    "operationKind": "query",
    "text": "query RelayModernStoreTest3Query(\n  $size: Float!\n) {\n  me {\n    ...RelayModernStoreTest3Fragment\n    id\n  }\n}\n\nfragment RelayModernStoreTest3Fragment on User {\n  name\n  profilePicture(size: $size) {\n    uri\n  }\n  ...RelayModernStoreTest4Fragment\n}\n\nfragment RelayModernStoreTest4Fragment on User {\n  username\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "e2ddae61c674ea02fc5872e1a1e192a3";
}

module.exports = node;
