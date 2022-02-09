/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<62898db05c5848c285e21b38f781245d>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayExperimentalGraphResponseTransformTestDupesQuery$variables = {||};
export type RelayExperimentalGraphResponseTransformTestDupesQuery$data = {|
  +me: ?{|
    +name: ?string,
  |},
  +fetch__User: ?{|
    +name: ?string,
    +doesViewerLike: ?boolean,
  |},
|};
export type RelayExperimentalGraphResponseTransformTestDupesQuery = {|
  variables: RelayExperimentalGraphResponseTransformTestDupesQuery$variables,
  response: RelayExperimentalGraphResponseTransformTestDupesQuery$data,
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
  {
    "kind": "Literal",
    "name": "id",
    "value": "100"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "doesViewerLike",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayExperimentalGraphResponseTransformTestDupesQuery",
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
      },
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "fetch__User",
        "plural": false,
        "selections": [
          (v0/*: any*/),
          (v2/*: any*/)
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
    "name": "RelayExperimentalGraphResponseTransformTestDupesQuery",
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
          (v3/*: any*/)
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "fetch__User",
        "plural": false,
        "selections": [
          (v0/*: any*/),
          (v2/*: any*/),
          (v3/*: any*/)
        ],
        "storageKey": "fetch__User(id:\"100\")"
      }
    ]
  },
  "params": {
    "cacheID": "695166f5105a9e6fed5e9209852a0ad5",
    "id": null,
    "metadata": {},
    "name": "RelayExperimentalGraphResponseTransformTestDupesQuery",
    "operationKind": "query",
    "text": "query RelayExperimentalGraphResponseTransformTestDupesQuery {\n  me {\n    name\n    id\n  }\n  fetch__User(id: \"100\") {\n    name\n    doesViewerLike\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "5b1ecc69ba47da95a0caf03ee553f180";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayExperimentalGraphResponseTransformTestDupesQuery$variables,
  RelayExperimentalGraphResponseTransformTestDupesQuery$data,
>*/);
