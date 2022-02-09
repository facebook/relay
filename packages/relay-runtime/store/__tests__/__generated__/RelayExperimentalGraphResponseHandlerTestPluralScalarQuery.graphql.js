/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<7699f7f5ca64d94030805662d8f0f915>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayExperimentalGraphResponseHandlerTestPluralScalarQuery$variables = {||};
export type RelayExperimentalGraphResponseHandlerTestPluralScalarQuery$data = {|
  +me: ?{|
    +emailAddresses: ?$ReadOnlyArray<?string>,
  |},
|};
export type RelayExperimentalGraphResponseHandlerTestPluralScalarQuery = {|
  variables: RelayExperimentalGraphResponseHandlerTestPluralScalarQuery$variables,
  response: RelayExperimentalGraphResponseHandlerTestPluralScalarQuery$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "emailAddresses",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayExperimentalGraphResponseHandlerTestPluralScalarQuery",
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
    "name": "RelayExperimentalGraphResponseHandlerTestPluralScalarQuery",
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
    "cacheID": "78aa076a70d061f008c10215caab9554",
    "id": null,
    "metadata": {},
    "name": "RelayExperimentalGraphResponseHandlerTestPluralScalarQuery",
    "operationKind": "query",
    "text": "query RelayExperimentalGraphResponseHandlerTestPluralScalarQuery {\n  me {\n    emailAddresses\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "5a8e3902858c91e8036db2efd5dc6576";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayExperimentalGraphResponseHandlerTestPluralScalarQuery$variables,
  RelayExperimentalGraphResponseHandlerTestPluralScalarQuery$data,
>*/);
