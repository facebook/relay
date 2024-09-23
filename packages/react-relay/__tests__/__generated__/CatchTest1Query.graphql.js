/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<26108362ed2ed7b909b0a750240daa44>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { Result } from "relay-runtime";
export type CatchTest1Query$variables = {||};
export type CatchTest1Query$data = {|
  +me: {|
    +name: Result<?string, $ReadOnlyArray<mixed>>,
  |},
|};
export type CatchTest1Query = {|
  response: CatchTest1Query$data,
  variables: CatchTest1Query$variables,
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
    "name": "CatchTest1Query",
    "selections": [
      {
        "kind": "RequiredField",
        "field": {
          "alias": null,
          "args": null,
          "concreteType": "User",
          "kind": "LinkedField",
          "name": "me",
          "plural": false,
          "selections": [
            {
              "kind": "CatchField",
              "field": (v0/*: any*/),
              "to": "RESULT",
              "path": "me.name"
            }
          ],
          "storageKey": null
        },
        "action": "THROW",
        "path": "me"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "CatchTest1Query",
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
    "cacheID": "dbcd7a290db8c4883ecc2c225a7c1818",
    "id": null,
    "metadata": {},
    "name": "CatchTest1Query",
    "operationKind": "query",
    "text": "query CatchTest1Query {\n  me {\n    name\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "caace83ff2eba5055c065fd58e31aa3b";
}

module.exports = ((node/*: any*/)/*: Query<
  CatchTest1Query$variables,
  CatchTest1Query$data,
>*/);
