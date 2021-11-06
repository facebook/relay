/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<96b6bb1057e81640a6d2ccd5aa58519a>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
export type RelayReaderRequiredFieldsTest18QueryVariables = {||};
export type RelayReaderRequiredFieldsTest18QueryResponse = {|
  +me: ?{|
    +client_nickname: string,
  |},
|};
export type RelayReaderRequiredFieldsTest18Query = {|
  variables: RelayReaderRequiredFieldsTest18QueryVariables,
  response: RelayReaderRequiredFieldsTest18QueryResponse,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "client_nickname",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderRequiredFieldsTest18Query",
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
            "kind": "ClientExtension",
            "selections": [
              {
                "kind": "RequiredField",
                "field": (v0/*: any*/),
                "action": "LOG",
                "path": "me.client_nickname"
              }
            ]
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
    "name": "RelayReaderRequiredFieldsTest18Query",
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
            "name": "id",
            "storageKey": null
          },
          {
            "kind": "ClientExtension",
            "selections": [
              (v0/*: any*/)
            ]
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "8af147fca15687fbec526bbb22d82a4b",
    "id": null,
    "metadata": {},
    "name": "RelayReaderRequiredFieldsTest18Query",
    "operationKind": "query",
    "text": "query RelayReaderRequiredFieldsTest18Query {\n  me {\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "b33ec9cb2117d55d71acf42e45db711d";
}

module.exports = node;
