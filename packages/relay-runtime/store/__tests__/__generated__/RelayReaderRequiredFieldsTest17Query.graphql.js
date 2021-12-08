/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<31a31e734d383ba23ad8bb6438f21f7e>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayReaderRequiredFieldsTest17Query$variables = {|
  skip: boolean,
|};
export type RelayReaderRequiredFieldsTest17QueryVariables = RelayReaderRequiredFieldsTest17Query$variables;
export type RelayReaderRequiredFieldsTest17Query$data = {|
  +me: ?{|
    +emailAddresses?: $ReadOnlyArray<?string>,
    +name: ?string,
  |},
|};
export type RelayReaderRequiredFieldsTest17QueryResponse = RelayReaderRequiredFieldsTest17Query$data;
export type RelayReaderRequiredFieldsTest17Query = {|
  variables: RelayReaderRequiredFieldsTest17QueryVariables,
  response: RelayReaderRequiredFieldsTest17Query$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "skip"
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
    "name": "RelayReaderRequiredFieldsTest17Query",
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
            "condition": "skip",
            "kind": "Condition",
            "passingValue": false,
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
    "name": "RelayReaderRequiredFieldsTest17Query",
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
            "condition": "skip",
            "kind": "Condition",
            "passingValue": false,
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
    "cacheID": "08455ff2f48786dcab1abc9272a2027f",
    "id": null,
    "metadata": {},
    "name": "RelayReaderRequiredFieldsTest17Query",
    "operationKind": "query",
    "text": "query RelayReaderRequiredFieldsTest17Query(\n  $skip: Boolean!\n) {\n  me {\n    emailAddresses @skip(if: $skip)\n    name\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "6fabad075998eb88ecad868a27a984dd";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderRequiredFieldsTest17Query$variables,
  RelayReaderRequiredFieldsTest17Query$data,
>*/);
