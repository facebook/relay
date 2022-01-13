/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<6dcae870ec17b6b504e562ea8f60849e>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayExperimentalGraphResponseHandlerTestNullLinkedQuery$variables = {||};
export type RelayExperimentalGraphResponseHandlerTestNullLinkedQueryVariables = RelayExperimentalGraphResponseHandlerTestNullLinkedQuery$variables;
export type RelayExperimentalGraphResponseHandlerTestNullLinkedQuery$data = {|
  +fetch__User: ?{|
    +name: ?string,
  |},
|};
export type RelayExperimentalGraphResponseHandlerTestNullLinkedQueryResponse = RelayExperimentalGraphResponseHandlerTestNullLinkedQuery$data;
export type RelayExperimentalGraphResponseHandlerTestNullLinkedQuery = {|
  variables: RelayExperimentalGraphResponseHandlerTestNullLinkedQueryVariables,
  response: RelayExperimentalGraphResponseHandlerTestNullLinkedQuery$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "100"
  }
],
v1 = {
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
    "name": "RelayExperimentalGraphResponseHandlerTestNullLinkedQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "fetch__User",
        "plural": false,
        "selections": [
          (v1/*: any*/)
        ],
        "storageKey": "fetch__User(id:\"100\")"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayExperimentalGraphResponseHandlerTestNullLinkedQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "fetch__User",
        "plural": false,
        "selections": [
          (v1/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          }
        ],
        "storageKey": "fetch__User(id:\"100\")"
      }
    ]
  },
  "params": {
    "cacheID": "1918062fe2dfd83600c8c9cc5669f795",
    "id": null,
    "metadata": {},
    "name": "RelayExperimentalGraphResponseHandlerTestNullLinkedQuery",
    "operationKind": "query",
    "text": "query RelayExperimentalGraphResponseHandlerTestNullLinkedQuery {\n  fetch__User(id: \"100\") {\n    name\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "e868347e3a048a26744812ce3be67387";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayExperimentalGraphResponseHandlerTestNullLinkedQuery$variables,
  RelayExperimentalGraphResponseHandlerTestNullLinkedQuery$data,
>*/);
