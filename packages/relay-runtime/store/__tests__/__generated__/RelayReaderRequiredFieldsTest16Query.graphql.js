/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<67882136ef38e58867a466932481f840>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayReaderRequiredFieldsTest16Query$variables = {|
  include: boolean,
|};
export type RelayReaderRequiredFieldsTest16QueryVariables = RelayReaderRequiredFieldsTest16Query$variables;
export type RelayReaderRequiredFieldsTest16Query$data = {|
  +me: ?{|
    +emailAddresses?: $ReadOnlyArray<?string>,
    +name: ?string,
  |},
|};
export type RelayReaderRequiredFieldsTest16QueryResponse = RelayReaderRequiredFieldsTest16Query$data;
export type RelayReaderRequiredFieldsTest16Query = {|
  variables: RelayReaderRequiredFieldsTest16QueryVariables,
  response: RelayReaderRequiredFieldsTest16Query$data,
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
    "argumentDefinitions": (v0/*: any*/),
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
                "field": (v1/*: any*/),
                "action": "LOG",
                "path": "me.emailAddresses"
              }
            ]
          },
          (v2/*: any*/)
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
              (v1/*: any*/)
            ]
          },
          (v2/*: any*/),
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
  (node/*: any*/).hash = "4e5254ca56fc4ada41a953cc705930cb";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderRequiredFieldsTest16Query$variables,
  RelayReaderRequiredFieldsTest16Query$data,
>*/);
