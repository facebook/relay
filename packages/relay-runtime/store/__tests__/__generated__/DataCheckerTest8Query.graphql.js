/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<a97f8b5010f53cd1193b18994298ad2c>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
export type DataCheckerTest8QueryVariables = {||};
export type DataCheckerTest8QueryResponse = {|
  +me: ?{|
    +profilePicture: ?{|
      +uri: ?string,
    |},
  |},
|};
export type DataCheckerTest8Query = {|
  variables: DataCheckerTest8QueryVariables,
  response: DataCheckerTest8QueryResponse,
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
    "name": "size",
    "value": 32
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "DataCheckerTest8Query",
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
            "alias": "profilePicture",
            "args": null,
            "concreteType": "Image",
            "kind": "LinkedField",
            "name": "__profilePicture_test",
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
    "name": "DataCheckerTest8Query",
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
            "name": "profilePicture",
            "plural": false,
            "selections": (v0/*: any*/),
            "storageKey": "profilePicture(size:32)"
          },
          {
            "alias": null,
            "args": (v1/*: any*/),
            "filters": null,
            "handle": "test",
            "key": "",
            "kind": "LinkedHandle",
            "name": "profilePicture"
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
    "cacheID": "9e7ead872a8e63d174627e6b500d7092",
    "id": null,
    "metadata": {},
    "name": "DataCheckerTest8Query",
    "operationKind": "query",
    "text": "query DataCheckerTest8Query {\n  me {\n    profilePicture(size: 32) {\n      uri\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "3a2b120bf24a1511e80aef6f40bdd1d4";
}

module.exports = node;
