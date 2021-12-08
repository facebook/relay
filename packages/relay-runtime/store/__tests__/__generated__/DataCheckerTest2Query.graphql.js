/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<41cbac780831e14fa979b28c0c9942a8>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type DataCheckerTest2Query$variables = {||};
export type DataCheckerTest2QueryVariables = DataCheckerTest2Query$variables;
export type DataCheckerTest2Query$data = {|
  +me: ?{|
    +profilePicture: ?{|
      +uri: ?string,
    |},
  |},
|};
export type DataCheckerTest2QueryResponse = DataCheckerTest2Query$data;
export type DataCheckerTest2Query = {|
  variables: DataCheckerTest2QueryVariables,
  response: DataCheckerTest2Query$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "size",
    "value": 32
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "DataCheckerTest2Query",
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
            "name": "profilePicture",
            "plural": false,
            "selections": [
              {
                "alias": "uri",
                "args": null,
                "kind": "ScalarField",
                "name": "__uri_test",
                "storageKey": null
              }
            ],
            "storageKey": "profilePicture(size:32)"
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
    "name": "DataCheckerTest2Query",
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
            "name": "profilePicture",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "uri",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "filters": null,
                "handle": "test",
                "key": "",
                "kind": "ScalarHandle",
                "name": "uri"
              }
            ],
            "storageKey": "profilePicture(size:32)"
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
    "cacheID": "25d9b9bf8df79f73e41a4671ce1d207d",
    "id": null,
    "metadata": {},
    "name": "DataCheckerTest2Query",
    "operationKind": "query",
    "text": "query DataCheckerTest2Query {\n  me {\n    profilePicture(size: 32) {\n      uri\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "7cd54b0080d8dab528631b15888562dc";
}

module.exports = ((node/*: any*/)/*: Query<
  DataCheckerTest2Query$variables,
  DataCheckerTest2Query$data,
>*/);
