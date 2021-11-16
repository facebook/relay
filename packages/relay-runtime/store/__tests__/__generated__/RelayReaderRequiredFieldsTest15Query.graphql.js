/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<a1444c1285fea1c3d02d9a84594d87c8>>
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
export type RelayReaderRequiredFieldsTest15QueryVariables = RelayReaderRequiredFieldsTest15Query$variables;
export type RelayReaderRequiredFieldsTest15Query$data = {|
  +me: ?{|
    +emailAddresses?: $ReadOnlyArray<?string>,
  |},
|};
export type RelayReaderRequiredFieldsTest15QueryResponse = RelayReaderRequiredFieldsTest15Query$data;
export type RelayReaderRequiredFieldsTest15Query = {|
  variables: RelayReaderRequiredFieldsTest15QueryVariables,
  response: RelayReaderRequiredFieldsTest15Query$data,
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
    "argumentDefinitions": (v0/*: any*/),
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
                "field": (v1/*: any*/),
                "action": "LOG",
                "path": "me.emailAddresses"
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
    "argumentDefinitions": (v0/*: any*/),
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
              (v1/*: any*/)
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
  (node/*: any*/).hash = "bd9e39092f49a2f31516ba716532e5ff";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderRequiredFieldsTest15Query$variables,
  RelayReaderRequiredFieldsTest15Query$data,
>*/);
