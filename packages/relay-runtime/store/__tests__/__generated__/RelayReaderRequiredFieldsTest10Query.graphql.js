/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<6b392c93053756355f6de0a42674dcd8>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayReaderRequiredFieldsTest10Query$variables = {||};
export type RelayReaderRequiredFieldsTest10QueryVariables = RelayReaderRequiredFieldsTest10Query$variables;
export type RelayReaderRequiredFieldsTest10Query$data = {|
  +me: ?{|
    +screennames: $ReadOnlyArray<?{|
      +name: ?string,
      +service: string,
    |}>,
  |},
|};
export type RelayReaderRequiredFieldsTest10QueryResponse = RelayReaderRequiredFieldsTest10Query$data;
export type RelayReaderRequiredFieldsTest10Query = {|
  variables: RelayReaderRequiredFieldsTest10QueryVariables,
  response: RelayReaderRequiredFieldsTest10Query$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "service",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderRequiredFieldsTest10Query",
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
            "kind": "RequiredField",
            "field": {
              "alias": null,
              "args": null,
              "concreteType": "Screenname",
              "kind": "LinkedField",
              "name": "screennames",
              "plural": true,
              "selections": [
                (v0/*: any*/),
                {
                  "kind": "RequiredField",
                  "field": (v1/*: any*/),
                  "action": "LOG",
                  "path": "me.screennames.service"
                }
              ],
              "storageKey": null
            },
            "action": "LOG",
            "path": "me.screennames"
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
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayReaderRequiredFieldsTest10Query",
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
            "alias": null,
            "args": null,
            "concreteType": "Screenname",
            "kind": "LinkedField",
            "name": "screennames",
            "plural": true,
            "selections": [
              (v0/*: any*/),
              (v1/*: any*/)
            ],
            "storageKey": null
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
    "cacheID": "81addceea0972da226c257480143bf62",
    "id": null,
    "metadata": {},
    "name": "RelayReaderRequiredFieldsTest10Query",
    "operationKind": "query",
    "text": "query RelayReaderRequiredFieldsTest10Query {\n  me {\n    screennames {\n      name\n      service\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "414e0ad6f131fd6948e5ccfeb6a1d258";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderRequiredFieldsTest10Query$variables,
  RelayReaderRequiredFieldsTest10Query$data,
>*/);
