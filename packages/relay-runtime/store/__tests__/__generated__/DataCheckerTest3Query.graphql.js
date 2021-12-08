/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<14f2c17b114922c9fed9bf25eb1c8ec6>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type DataCheckerTest3Query$variables = {||};
export type DataCheckerTest3QueryVariables = DataCheckerTest3Query$variables;
export type DataCheckerTest3Query$data = {|
  +me: ?{|
    +profilePicture: ?{|
      +uri: ?string,
    |},
  |},
|};
export type DataCheckerTest3QueryResponse = DataCheckerTest3Query$data;
export type DataCheckerTest3Query = {|
  variables: DataCheckerTest3QueryVariables,
  response: DataCheckerTest3Query$data,
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
    "name": "DataCheckerTest3Query",
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
    "name": "DataCheckerTest3Query",
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
    "cacheID": "8b68c68a33471cc2ae26a65cdf262dca",
    "id": null,
    "metadata": {},
    "name": "DataCheckerTest3Query",
    "operationKind": "query",
    "text": "query DataCheckerTest3Query {\n  me {\n    profilePicture(size: 32) {\n      uri\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "a3a12cb34be08326303b43d116f29246";
}

module.exports = ((node/*: any*/)/*: Query<
  DataCheckerTest3Query$variables,
  DataCheckerTest3Query$data,
>*/);
