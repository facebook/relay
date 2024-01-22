/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<d1561b1db0d3df107b2267a80a665d8a>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayReaderRelayErrorHandlingTest2Query$variables = {||};
export type RelayReaderRelayErrorHandlingTest2Query$data = {|
  +me: ?{|
    +lastName: ?string,
  |},
|};
export type RelayReaderRelayErrorHandlingTest2Query = {|
  response: RelayReaderRelayErrorHandlingTest2Query$data,
  variables: RelayReaderRelayErrorHandlingTest2Query$variables,
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
    "name": "RelayReaderRelayErrorHandlingTest2Query",
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
    "name": "RelayReaderRelayErrorHandlingTest2Query",
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
    "cacheID": "6b8c010a0d91f4f7baa63cff39a7134a",
    "id": null,
    "metadata": {},
    "name": "RelayReaderRelayErrorHandlingTest2Query",
    "operationKind": "query",
    "text": "query RelayReaderRelayErrorHandlingTest2Query {\n  me {\n    lastName\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "89a4174b333dd303677d0e197c236178";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderRelayErrorHandlingTest2Query$variables,
  RelayReaderRelayErrorHandlingTest2Query$data,
>*/);
