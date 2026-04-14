/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<5d1c0074d68a83e9e14bc1a4bb75e1fd>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayReaderRequiredFieldsTest6Query$variables = {||};
export type RelayReaderRequiredFieldsTest6Query$data = {|
  +me: ?{|
    +backgroundImage: {|
      +uri: string,
    |},
  |},
|};
export type RelayReaderRequiredFieldsTest6Query = {|
  response: RelayReaderRequiredFieldsTest6Query$data,
  variables: RelayReaderRequiredFieldsTest6Query$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "uri",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderRequiredFieldsTest6Query",
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
              "concreteType": "Image",
              "kind": "LinkedField",
              "name": "backgroundImage",
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
            "action": "LOG"
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
    "name": "RelayReaderRequiredFieldsTest6Query",
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
            "concreteType": "Image",
            "kind": "LinkedField",
            "name": "backgroundImage",
            "plural": false,
            "selections": [
              (v0/*:: as any*/)
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
    "cacheID": "b4d0b1aacd67a610613e5dff05e9dda3",
    "id": null,
    "metadata": {},
    "name": "RelayReaderRequiredFieldsTest6Query",
    "operationKind": "query",
    "text": "query RelayReaderRequiredFieldsTest6Query {\n  me {\n    backgroundImage {\n      uri\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "e1267ec21a6f7214ada08e4e764d50a5";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  RelayReaderRequiredFieldsTest6Query$variables,
  RelayReaderRequiredFieldsTest6Query$data,
>*/);
