/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<19bf9213eab0f5958a83480be8556a8f>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { Result } from "relay-runtime";
export type RelayReaderCatchFieldsTestSiblingLogRequiredErrorQuery$variables = {||};
export type RelayReaderCatchFieldsTestSiblingLogRequiredErrorQuery$data = {|
  +alsoMe: ?{|
    +lastName: string,
  |},
  +me: Result<?{|
    +firstName: string,
  |}, unknown>,
|};
export type RelayReaderCatchFieldsTestSiblingLogRequiredErrorQuery = {|
  response: RelayReaderCatchFieldsTestSiblingLogRequiredErrorQuery$data,
  variables: RelayReaderCatchFieldsTestSiblingLogRequiredErrorQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "lastName",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "firstName",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderCatchFieldsTestSiblingLogRequiredErrorQuery",
    "selections": [
      {
        "alias": "alsoMe",
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          {
            "kind": "RequiredField",
            "field": (v0/*:: as any*/),
            "action": "LOG"
          }
        ],
        "storageKey": null
      },
      {
        "kind": "CatchField",
        "field": {
          "alias": null,
          "args": null,
          "concreteType": "User",
          "kind": "LinkedField",
          "name": "me",
          "plural": false,
          "selections": [
            {
              "kind": "RequiredField",
              "field": (v1/*:: as any*/),
              "action": "THROW"
            }
          ],
          "storageKey": null
        },
        "to": "RESULT"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayReaderCatchFieldsTestSiblingLogRequiredErrorQuery",
    "selections": [
      {
        "alias": "alsoMe",
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          (v0/*:: as any*/),
          (v2/*:: as any*/)
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          (v1/*:: as any*/),
          (v2/*:: as any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "efc5eb392f86265d53741334d1d9804b",
    "id": null,
    "metadata": {},
    "name": "RelayReaderCatchFieldsTestSiblingLogRequiredErrorQuery",
    "operationKind": "query",
    "text": "query RelayReaderCatchFieldsTestSiblingLogRequiredErrorQuery {\n  alsoMe: me {\n    lastName\n    id\n  }\n  me {\n    firstName\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "92ad5972e7b9516f470d0ab4f548a16d";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  RelayReaderCatchFieldsTestSiblingLogRequiredErrorQuery$variables,
  RelayReaderCatchFieldsTestSiblingLogRequiredErrorQuery$data,
>*/);
