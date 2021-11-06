/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<56124bab5c8c7baf5b9760268d33326a>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
export type RelayStoreUtilsTest1QueryVariables = {||};
export type RelayStoreUtilsTest1QueryResponse = {|
  +me: ?{|
    +address: ?{|
      +city: ?string,
    |},
  |},
|};
export type RelayStoreUtilsTest1Query = {|
  variables: RelayStoreUtilsTest1QueryVariables,
  response: RelayStoreUtilsTest1QueryResponse,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "city",
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayStoreUtilsTest1Query",
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
            "alias": "address",
            "args": null,
            "concreteType": "StreetAddress",
            "kind": "LinkedField",
            "name": "__UserQuery_address_addressHandler",
            "plural": false,
            "selections": (v0/*: any*/),
            "storageKey": null
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
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayStoreUtilsTest1Query",
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
            "concreteType": "StreetAddress",
            "kind": "LinkedField",
            "name": "address",
            "plural": false,
            "selections": (v0/*: any*/),
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "filters": null,
            "handle": "addressHandler",
            "key": "UserQuery_address",
            "kind": "LinkedHandle",
            "name": "address"
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
    "cacheID": "f08a810a037ec77f166323f75a344bf7",
    "id": null,
    "metadata": {},
    "name": "RelayStoreUtilsTest1Query",
    "operationKind": "query",
    "text": "query RelayStoreUtilsTest1Query {\n  me {\n    address {\n      city\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "d17659fb075bc208ab1af109ed7f442c";
}

module.exports = node;
