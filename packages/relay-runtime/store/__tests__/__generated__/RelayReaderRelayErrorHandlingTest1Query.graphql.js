/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<8109949e4e7d1f86610c1aad68b02782>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayReaderRelayErrorHandlingTest1Query$variables = {||};
export type RelayReaderRelayErrorHandlingTest1Query$data = {|
  +me: ?{|
    +lastName: ?string,
  |},
|};
export type RelayReaderRelayErrorHandlingTest1Query = {|
  response: RelayReaderRelayErrorHandlingTest1Query$data,
  variables: RelayReaderRelayErrorHandlingTest1Query$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "lastName",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderRelayErrorHandlingTest1Query",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          (v0/*: any*/)
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
    "name": "RelayReaderRelayErrorHandlingTest1Query",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          (v0/*: any*/),
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
    "cacheID": "e3098f4a550368c2e87bbe6b06628604",
    "id": null,
    "metadata": {},
    "name": "RelayReaderRelayErrorHandlingTest1Query",
    "operationKind": "query",
    "text": "query RelayReaderRelayErrorHandlingTest1Query {\n  me {\n    lastName\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "7be565b5d7792f0144f4cc4e34853a6f";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderRelayErrorHandlingTest1Query$variables,
  RelayReaderRelayErrorHandlingTest1Query$data,
>*/);
