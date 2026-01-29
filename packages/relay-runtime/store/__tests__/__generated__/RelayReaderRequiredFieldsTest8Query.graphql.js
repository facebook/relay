/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<f058af0bb693d259e91abada0a8f9b52>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayReaderRequiredFieldsTest8Query$variables = {||};
export type RelayReaderRequiredFieldsTest8Query$data = {|
  +me: ?{|
    +screennames: ?ReadonlyArray<?{|
      +name: ?string,
      +service: string,
    |}>,
  |},
|};
export type RelayReaderRequiredFieldsTest8Query = {|
  response: RelayReaderRequiredFieldsTest8Query$data,
  variables: RelayReaderRequiredFieldsTest8Query$variables,
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
    "name": "RelayReaderRequiredFieldsTest8Query",
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
              {
                "kind": "RequiredField",
                "field": (v1/*: any*/),
                "action": "LOG"
              }
            ],
            "storageKey": null
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
    "name": "RelayReaderRequiredFieldsTest8Query",
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
    "cacheID": "e2970cea8ac61eb3139144eda585844a",
    "id": null,
    "metadata": {},
    "name": "RelayReaderRequiredFieldsTest8Query",
    "operationKind": "query",
    "text": "query RelayReaderRequiredFieldsTest8Query {\n  me {\n    screennames {\n      name\n      service\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "0e92cecb5b49ee10cf1f34d6463613d6";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderRequiredFieldsTest8Query$variables,
  RelayReaderRequiredFieldsTest8Query$data,
>*/);
