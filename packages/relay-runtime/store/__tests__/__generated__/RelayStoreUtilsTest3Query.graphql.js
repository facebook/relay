/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<9113bfd99968d8c6f705d3a3e364bff2>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayStoreUtilsTest3Query$variables = {||};
export type RelayStoreUtilsTest3QueryVariables = RelayStoreUtilsTest3Query$variables;
export type RelayStoreUtilsTest3Query$data = {|
  +me: ?{|
    +profile_picture: ?{|
      +uri: ?string,
    |},
  |},
|};
export type RelayStoreUtilsTest3QueryResponse = RelayStoreUtilsTest3Query$data;
export type RelayStoreUtilsTest3Query = {|
  variables: RelayStoreUtilsTest3QueryVariables,
  response: RelayStoreUtilsTest3Query$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "scale",
    "value": 42
  }
],
v1 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "uri",
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayStoreUtilsTest3Query",
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
            "alias": "profile_picture",
            "args": (v0/*: any*/),
            "concreteType": "Image",
            "kind": "LinkedField",
            "name": "__UserQuery_profile_picture_photoHandler",
            "plural": false,
            "selections": (v1/*: any*/),
            "storageKey": "__UserQuery_profile_picture_photoHandler(scale:42)"
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
    "name": "RelayStoreUtilsTest3Query",
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
            "args": (v0/*: any*/),
            "concreteType": "Image",
            "kind": "LinkedField",
            "name": "profile_picture",
            "plural": false,
            "selections": (v1/*: any*/),
            "storageKey": "profile_picture(scale:42)"
          },
          {
            "alias": null,
            "args": (v0/*: any*/),
            "filters": [
              "scale"
            ],
            "handle": "photoHandler",
            "key": "UserQuery_profile_picture",
            "kind": "LinkedHandle",
            "name": "profile_picture"
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
    "cacheID": "019a9443ab9266b7836afbcab6eeda98",
    "id": null,
    "metadata": {},
    "name": "RelayStoreUtilsTest3Query",
    "operationKind": "query",
    "text": "query RelayStoreUtilsTest3Query {\n  me {\n    profile_picture(scale: 42) {\n      uri\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "71c0909b2a64f3fef914d02dc95dd6fd";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayStoreUtilsTest3Query$variables,
  RelayStoreUtilsTest3Query$data,
>*/);
