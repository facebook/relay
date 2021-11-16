/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<0f3b6d90c5bcd8f1ad7acd783b499dd7>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayReaderRequiredFieldsTest9Query$variables = {||};
export type RelayReaderRequiredFieldsTest9QueryVariables = RelayReaderRequiredFieldsTest9Query$variables;
export type RelayReaderRequiredFieldsTest9Query$data = {|
  +me: ?{|
    +emailAddresses: $ReadOnlyArray<?string>,
  |},
|};
export type RelayReaderRequiredFieldsTest9QueryResponse = RelayReaderRequiredFieldsTest9Query$data;
export type RelayReaderRequiredFieldsTest9Query = {|
  variables: RelayReaderRequiredFieldsTest9QueryVariables,
  response: RelayReaderRequiredFieldsTest9Query$data,
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
    "name": "RelayReaderRequiredFieldsTest9Query",
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
            "field": (v0/*: any*/),
            "action": "LOG",
            "path": "me.emailAddresses"
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
    "name": "RelayReaderRequiredFieldsTest9Query",
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
    "cacheID": "29075aca4ae5734cb3fb13c866476d75",
    "id": null,
    "metadata": {},
    "name": "RelayReaderRequiredFieldsTest9Query",
    "operationKind": "query",
    "text": "query RelayReaderRequiredFieldsTest9Query {\n  me {\n    emailAddresses\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "7c1aeaf481910818ae744a98371df995";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderRequiredFieldsTest9Query$variables,
  RelayReaderRequiredFieldsTest9Query$data,
>*/);
