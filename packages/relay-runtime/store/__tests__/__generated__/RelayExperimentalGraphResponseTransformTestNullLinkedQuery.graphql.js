/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<079e0ecb83510382563eef0e2936d62d>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayExperimentalGraphResponseTransformTestNullLinkedQuery$variables = {||};
export type RelayExperimentalGraphResponseTransformTestNullLinkedQueryVariables = RelayExperimentalGraphResponseTransformTestNullLinkedQuery$variables;
export type RelayExperimentalGraphResponseTransformTestNullLinkedQuery$data = {|
  +fetch__User: ?{|
    +name: ?string,
  |},
|};
export type RelayExperimentalGraphResponseTransformTestNullLinkedQueryResponse = RelayExperimentalGraphResponseTransformTestNullLinkedQuery$data;
export type RelayExperimentalGraphResponseTransformTestNullLinkedQuery = {|
  variables: RelayExperimentalGraphResponseTransformTestNullLinkedQueryVariables,
  response: RelayExperimentalGraphResponseTransformTestNullLinkedQuery$data,
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
    "name": "RelayExperimentalGraphResponseTransformTestNullLinkedQuery",
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
    "name": "RelayExperimentalGraphResponseTransformTestNullLinkedQuery",
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
    "cacheID": "956a1ad98831656d17572a6d6fa06813",
    "id": null,
    "metadata": {},
    "name": "RelayExperimentalGraphResponseTransformTestNullLinkedQuery",
    "operationKind": "query",
    "text": "query RelayExperimentalGraphResponseTransformTestNullLinkedQuery {\n  fetch__User(id: \"100\") {\n    name\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "f63a305831029f2803bc700961066308";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayExperimentalGraphResponseTransformTestNullLinkedQuery$variables,
  RelayExperimentalGraphResponseTransformTestNullLinkedQuery$data,
>*/);
