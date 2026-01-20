/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<b56065a3aeb80e8345196805f9e4a157>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayExperimentalGraphResponseHandlerTestPluralLinkedQuery$variables = {||};
export type RelayExperimentalGraphResponseHandlerTestPluralLinkedQuery$data = {|
  +me: ?{|
    +allPhones: ?ReadonlyArray<?{|
      +isVerified: ?boolean,
    |}>,
  |},
|};
export type RelayExperimentalGraphResponseHandlerTestPluralLinkedQuery = {|
  response: RelayExperimentalGraphResponseHandlerTestPluralLinkedQuery$data,
  variables: RelayExperimentalGraphResponseHandlerTestPluralLinkedQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "concreteType": "Phone",
  "kind": "LinkedField",
  "name": "allPhones",
  "plural": true,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "isVerified",
      "storageKey": null
    }
  ],
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayExperimentalGraphResponseHandlerTestPluralLinkedQuery",
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
    "name": "RelayExperimentalGraphResponseHandlerTestPluralLinkedQuery",
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
    "cacheID": "be819dfeef09f1cb17dcae73fa1a4618",
    "id": null,
    "metadata": {},
    "name": "RelayExperimentalGraphResponseHandlerTestPluralLinkedQuery",
    "operationKind": "query",
    "text": "query RelayExperimentalGraphResponseHandlerTestPluralLinkedQuery {\n  me {\n    allPhones {\n      isVerified\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "18e7873aba7d64d382b1880905180d86";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayExperimentalGraphResponseHandlerTestPluralLinkedQuery$variables,
  RelayExperimentalGraphResponseHandlerTestPluralLinkedQuery$data,
>*/);
