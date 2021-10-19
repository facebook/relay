/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<662899b267dc3ef34d1031f8a3b96573>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
export type cloneRelayHandleSourceFieldTestTestQueryVariables = {||};
export type cloneRelayHandleSourceFieldTestTestQueryResponse = {|
  +me: ?{|
    +address: ?{|
      +street: ?string,
    |},
  |},
|};
export type cloneRelayHandleSourceFieldTestTestQuery = {|
  variables: cloneRelayHandleSourceFieldTestTestQueryVariables,
  response: cloneRelayHandleSourceFieldTestTestQueryResponse,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "street",
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "cloneRelayHandleSourceFieldTestTestQuery",
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
            "name": "__address_test",
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
    "name": "cloneRelayHandleSourceFieldTestTestQuery",
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
            "handle": "test",
            "key": "",
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
    "cacheID": "e444f01d40f727f6f9db7f6aba2a63b2",
    "id": null,
    "metadata": {},
    "name": "cloneRelayHandleSourceFieldTestTestQuery",
    "operationKind": "query",
    "text": "query cloneRelayHandleSourceFieldTestTestQuery {\n  me {\n    address {\n      street\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "b25d254d9cced587a60803f29606c8b5";
}

module.exports = node;
