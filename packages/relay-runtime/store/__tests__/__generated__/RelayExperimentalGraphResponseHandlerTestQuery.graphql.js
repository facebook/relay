/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<dcba95726592405ab1275ca750fbb4c2>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayExperimentalGraphResponseHandlerTestQuery$variables = {||};
export type RelayExperimentalGraphResponseHandlerTestQueryVariables = RelayExperimentalGraphResponseHandlerTestQuery$variables;
export type RelayExperimentalGraphResponseHandlerTestQuery$data = {|
  +me: ?{|
    +name: ?string,
  |},
|};
export type RelayExperimentalGraphResponseHandlerTestQueryResponse = RelayExperimentalGraphResponseHandlerTestQuery$data;
export type RelayExperimentalGraphResponseHandlerTestQuery = {|
  variables: RelayExperimentalGraphResponseHandlerTestQueryVariables,
  response: RelayExperimentalGraphResponseHandlerTestQuery$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayExperimentalGraphResponseHandlerTestQuery",
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
    "name": "RelayExperimentalGraphResponseHandlerTestQuery",
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
    "cacheID": "bf669cd6fcdb8a72b4090fc580279a0a",
    "id": null,
    "metadata": {},
    "name": "RelayExperimentalGraphResponseHandlerTestQuery",
    "operationKind": "query",
    "text": "query RelayExperimentalGraphResponseHandlerTestQuery {\n  me {\n    name\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "e3a809d086b3029881acae93cbf5999d";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayExperimentalGraphResponseHandlerTestQuery$variables,
  RelayExperimentalGraphResponseHandlerTestQuery$data,
>*/);
