/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<e877dd1fa3b7d2d011ec77cbd79e4bd1>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayReaderRequiredFieldsTest15Query$variables = {|
  include: boolean,
|};
export type RelayReaderRequiredFieldsTest15Query$data = {|
  +me: ?{|
    +emailAddresses?: ReadonlyArray<?string>,
  |},
|};
export type RelayReaderRequiredFieldsTest15Query = {|
  response: RelayReaderRequiredFieldsTest15Query$data,
  variables: RelayReaderRequiredFieldsTest15Query$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "include"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "emailAddresses",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderRequiredFieldsTest15Query",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          {
            "condition": "include",
            "kind": "Condition",
            "passingValue": true,
            "selections": [
              {
                "kind": "RequiredField",
                "field": (v1/*:: as any*/),
                "action": "LOG"
              }
            ]
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "RelayReaderRequiredFieldsTest15Query",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          {
            "condition": "include",
            "kind": "Condition",
            "passingValue": true,
            "selections": [
              (v1/*:: as any*/)
            ]
          },
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
    "cacheID": "6a8782ad7653a733ecf1e3d6109171af",
    "id": null,
    "metadata": {},
    "name": "RelayReaderRequiredFieldsTest15Query",
    "operationKind": "query",
    "text": "query RelayReaderRequiredFieldsTest15Query(\n  $include: Boolean!\n) {\n  me {\n    emailAddresses @include(if: $include)\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "bd9e39092f49a2f31516ba716532e5ff";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  RelayReaderRequiredFieldsTest15Query$variables,
  RelayReaderRequiredFieldsTest15Query$data,
>*/);
