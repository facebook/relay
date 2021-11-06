/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<41d61c608590a5b40d8ad282f9f1b367>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
export type RelayReaderRequiredFieldsTest6QueryVariables = {||};
export type RelayReaderRequiredFieldsTest6QueryResponse = {|
  +me: ?{|
    +backgroundImage: {|
      +uri: string,
    |},
  |},
|};
export type RelayReaderRequiredFieldsTest6Query = {|
  variables: RelayReaderRequiredFieldsTest6QueryVariables,
  response: RelayReaderRequiredFieldsTest6QueryResponse,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "uri",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderRequiredFieldsTest6Query",
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
            "kind": "RequiredField",
            "field": {
              "alias": null,
              "args": null,
              "concreteType": "Image",
              "kind": "LinkedField",
              "name": "backgroundImage",
              "plural": false,
              "selections": [
                {
                  "kind": "RequiredField",
                  "field": (v0/*: any*/),
                  "action": "LOG",
                  "path": "me.backgroundImage.uri"
                }
              ],
              "storageKey": null
            },
            "action": "LOG",
            "path": "me.backgroundImage"
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
    "name": "RelayReaderRequiredFieldsTest6Query",
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
            "concreteType": "Image",
            "kind": "LinkedField",
            "name": "backgroundImage",
            "plural": false,
            "selections": [
              (v0/*: any*/)
            ],
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
    "cacheID": "b4d0b1aacd67a610613e5dff05e9dda3",
    "id": null,
    "metadata": {},
    "name": "RelayReaderRequiredFieldsTest6Query",
    "operationKind": "query",
    "text": "query RelayReaderRequiredFieldsTest6Query {\n  me {\n    backgroundImage {\n      uri\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "e1267ec21a6f7214ada08e4e764d50a5";
}

module.exports = node;
