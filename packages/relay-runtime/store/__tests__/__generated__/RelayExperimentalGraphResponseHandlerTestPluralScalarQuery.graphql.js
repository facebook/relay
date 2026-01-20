/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<1806f9be2f6e0040035bd8d4dd940842>>
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
    +emailAddresses: ?ReadonlyArray<?string>,
  |},
|};
export type RelayExperimentalGraphResponseHandlerTestPluralScalarQuery = {|
  response: RelayExperimentalGraphResponseHandlerTestPluralScalarQuery$data,
  variables: RelayExperimentalGraphResponseHandlerTestPluralScalarQuery$variables,
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
