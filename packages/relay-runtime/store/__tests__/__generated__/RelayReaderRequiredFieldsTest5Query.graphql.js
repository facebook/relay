/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<07bb0ab78173d9feebcc8c1772d189b5>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayReaderRequiredFieldsTest5Query$variables = {||};
export type RelayReaderRequiredFieldsTest5QueryVariables = RelayReaderRequiredFieldsTest5Query$variables;
export type RelayReaderRequiredFieldsTest5Query$data = {|
  +me: ?{|
    +backgroundImage: ?{|
      +uri: string,
    |},
  |},
|};
export type RelayReaderRequiredFieldsTest5QueryResponse = RelayReaderRequiredFieldsTest5Query$data;
export type RelayReaderRequiredFieldsTest5Query = {|
  variables: RelayReaderRequiredFieldsTest5QueryVariables,
  response: RelayReaderRequiredFieldsTest5Query$data,
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
    "name": "RelayReaderRequiredFieldsTest5Query",
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
              {
                "kind": "RequiredField",
                "field": (v0/*: any*/),
                "action": "LOG",
                "path": "me.backgroundImage.uri"
              }
            ],
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
    "name": "RelayReaderRequiredFieldsTest5Query",
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
    "cacheID": "563afe302d48acfc7f0676981cdc0407",
    "id": null,
    "metadata": {},
    "name": "RelayReaderRequiredFieldsTest5Query",
    "operationKind": "query",
    "text": "query RelayReaderRequiredFieldsTest5Query {\n  me {\n    backgroundImage {\n      uri\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "400e3c6f57b96a5e00c81409339db603";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderRequiredFieldsTest5Query$variables,
  RelayReaderRequiredFieldsTest5Query$data,
>*/);
