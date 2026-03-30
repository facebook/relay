/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<6c391f860d6b3e86c9b0958853cd72b3>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayReaderRequiredFieldsTest16Query$variables = {|
  include: boolean,
|};
export type RelayReaderRequiredFieldsTest16Query$data = {|
  +me: ?{|
    +emailAddresses?: ReadonlyArray<?string>,
    +name: ?string,
  |},
|};
export type RelayReaderRequiredFieldsTest16Query = {|
  response: RelayReaderRequiredFieldsTest16Query$data,
  variables: RelayReaderRequiredFieldsTest16Query$variables,
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
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderRequiredFieldsTest16Query",
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
          },
          (v2/*:: as any*/)
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
    "name": "RelayReaderRequiredFieldsTest16Query",
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
          (v2/*:: as any*/),
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
    "cacheID": "62010fd6515ccba81a4e898eb64962e3",
    "id": null,
    "metadata": {},
    "name": "RelayReaderRequiredFieldsTest16Query",
    "operationKind": "query",
    "text": "query RelayReaderRequiredFieldsTest16Query(\n  $include: Boolean!\n) {\n  me {\n    emailAddresses @include(if: $include)\n    name\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "4e5254ca56fc4ada41a953cc705930cb";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  RelayReaderRequiredFieldsTest16Query$variables,
  RelayReaderRequiredFieldsTest16Query$data,
>*/);
