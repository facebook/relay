/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<54e7071d7162b6dc8134c8602146cc63>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayExperimentalGraphResponseTransformTestPluralLinkedQuery$variables = {||};
export type RelayExperimentalGraphResponseTransformTestPluralLinkedQuery$data = {|
  +me: ?{|
    +allPhones: ?ReadonlyArray<?{|
      +isVerified: ?boolean,
    |}>,
  |},
|};
export type RelayExperimentalGraphResponseTransformTestPluralLinkedQuery = {|
  response: RelayExperimentalGraphResponseTransformTestPluralLinkedQuery$data,
  variables: RelayExperimentalGraphResponseTransformTestPluralLinkedQuery$variables,
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
    "name": "RelayExperimentalGraphResponseTransformTestPluralLinkedQuery",
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
    "name": "RelayExperimentalGraphResponseTransformTestPluralLinkedQuery",
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
    "cacheID": "f43f4733548942db3cc630b19d685b8d",
    "id": null,
    "metadata": {},
    "name": "RelayExperimentalGraphResponseTransformTestPluralLinkedQuery",
    "operationKind": "query",
    "text": "query RelayExperimentalGraphResponseTransformTestPluralLinkedQuery {\n  me {\n    allPhones {\n      isVerified\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "ec4c6e2929cb42544002f6387b010d31";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayExperimentalGraphResponseTransformTestPluralLinkedQuery$variables,
  RelayExperimentalGraphResponseTransformTestPluralLinkedQuery$data,
>*/);
