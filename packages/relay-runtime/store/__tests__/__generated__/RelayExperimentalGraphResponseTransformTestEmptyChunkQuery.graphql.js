/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<7257f4793e9aca16faa5a100f132053a>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayExperimentalGraphResponseTransformTestEmptyChunkQuery$variables = {||};
export type RelayExperimentalGraphResponseTransformTestEmptyChunkQuery$data = {|
  +fetch__User: ?{|
    +name: ?string,
  |},
  +me: ?{|
    +name: ?string,
  |},
|};
export type RelayExperimentalGraphResponseTransformTestEmptyChunkQuery = {|
  response: RelayExperimentalGraphResponseTransformTestEmptyChunkQuery$data,
  variables: RelayExperimentalGraphResponseTransformTestEmptyChunkQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v1 = [
  (v0/*: any*/)
],
v2 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "100"
  }
],
v3 = [
  (v0/*: any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "id",
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayExperimentalGraphResponseTransformTestEmptyChunkQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": (v1/*: any*/),
        "storageKey": null
      },
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "fetch__User",
        "plural": false,
        "selections": (v1/*: any*/),
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
    "name": "RelayExperimentalGraphResponseTransformTestEmptyChunkQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": (v3/*: any*/),
        "storageKey": null
      },
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "fetch__User",
        "plural": false,
        "selections": (v3/*: any*/),
        "storageKey": "fetch__User(id:\"100\")"
      }
    ]
  },
  "params": {
    "cacheID": "9c29f5c1df45b0a6585fc593bca66fbe",
    "id": null,
    "metadata": {},
    "name": "RelayExperimentalGraphResponseTransformTestEmptyChunkQuery",
    "operationKind": "query",
    "text": "query RelayExperimentalGraphResponseTransformTestEmptyChunkQuery {\n  me {\n    name\n    id\n  }\n  fetch__User(id: \"100\") {\n    name\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "301c4868119c12a0b6c8186a98b9910e";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayExperimentalGraphResponseTransformTestEmptyChunkQuery$variables,
  RelayExperimentalGraphResponseTransformTestEmptyChunkQuery$data,
>*/);
