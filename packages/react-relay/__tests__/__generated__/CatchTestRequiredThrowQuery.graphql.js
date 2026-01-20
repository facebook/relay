/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<7ac640598d293d4b2ca2e00ea79bd03b>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { Result } from "relay-runtime";
export type CatchTestRequiredThrowQuery$variables = {||};
export type CatchTestRequiredThrowQuery$data = {|
  +me: Result<?{|
    +name: string,
  |}, unknown>,
|};
export type CatchTestRequiredThrowQuery = {|
  response: CatchTestRequiredThrowQuery$data,
  variables: CatchTestRequiredThrowQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "CatchTestRequiredThrowQuery",
    "selections": [
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
              "field": (v0/*: any*/),
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
    "name": "CatchTestRequiredThrowQuery",
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
    "cacheID": "41c392954f583a7a736b388eb8973d17",
    "id": null,
    "metadata": {},
    "name": "CatchTestRequiredThrowQuery",
    "operationKind": "query",
    "text": "query CatchTestRequiredThrowQuery {\n  me {\n    name\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "0cd1f80b178868fc4fb8ddb6b5aabc83";
}

module.exports = ((node/*: any*/)/*: Query<
  CatchTestRequiredThrowQuery$variables,
  CatchTestRequiredThrowQuery$data,
>*/);
