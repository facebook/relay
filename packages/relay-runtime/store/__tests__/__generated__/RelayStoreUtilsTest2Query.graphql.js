/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<1073ce2ec06a006e146c0e51ab235bea>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayStoreUtilsTest2Query$variables = {||};
export type RelayStoreUtilsTest2QueryVariables = RelayStoreUtilsTest2Query$variables;
export type RelayStoreUtilsTest2Query$data = {|
  +me: ?{|
    +profile_picture: ?{|
      +uri: ?string,
    |},
  |},
|};
export type RelayStoreUtilsTest2QueryResponse = RelayStoreUtilsTest2Query$data;
export type RelayStoreUtilsTest2Query = {|
  variables: RelayStoreUtilsTest2QueryVariables,
  response: RelayStoreUtilsTest2Query$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "uri",
    "storageKey": null
  }
],
v1 = [
  {
    "kind": "Literal",
    "name": "scale",
    "value": 42
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayStoreUtilsTest2Query",
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
            "args": null,
            "concreteType": "Image",
            "kind": "LinkedField",
            "name": "__UserQuery_profile_picture_photoHandler",
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
    "name": "RelayStoreUtilsTest2Query",
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
            "args": (v1/*: any*/),
            "concreteType": "Image",
            "kind": "LinkedField",
            "name": "profile_picture",
            "plural": false,
            "selections": (v0/*: any*/),
            "storageKey": "profile_picture(scale:42)"
          },
          {
            "alias": null,
            "args": (v1/*: any*/),
            "filters": null,
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
    "cacheID": "efc07198ffbe738e46ac44ba07dded1b",
    "id": null,
    "metadata": {},
    "name": "RelayStoreUtilsTest2Query",
    "operationKind": "query",
    "text": "query RelayStoreUtilsTest2Query {\n  me {\n    profile_picture(scale: 42) {\n      uri\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "a82c4f8b284288bdf23bccb1627ba8b1";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayStoreUtilsTest2Query$variables,
  RelayStoreUtilsTest2Query$data,
>*/);
