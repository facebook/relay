/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<3188959cd85485fa64ffa1d2a66b1dac>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
export type RelayPublishQueueTest3QueryVariables = {||};
export type RelayPublishQueueTest3QueryResponse = {|
  +me: ?{|
    +screennames: ?$ReadOnlyArray<?{|
      +name: ?string,
    |}>,
  |},
|};
export type RelayPublishQueueTest3Query = {|
  variables: RelayPublishQueueTest3QueryVariables,
  response: RelayPublishQueueTest3QueryResponse,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayPublishQueueTest3Query",
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
            "alias": "screennames",
            "args": null,
            "concreteType": "Screenname",
            "kind": "LinkedField",
            "name": "__screennames_handleScreennames",
            "plural": true,
            "selections": [
              {
                "alias": "name",
                "args": null,
                "kind": "ScalarField",
                "name": "__name_handleName",
                "storageKey": null
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
    "name": "RelayPublishQueueTest3Query",
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
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "name",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "filters": null,
                "handle": "handleName",
                "key": "",
                "kind": "ScalarHandle",
                "name": "name"
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "filters": null,
            "handle": "handleScreennames",
            "key": "",
            "kind": "LinkedHandle",
            "name": "screennames"
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
    "cacheID": "30e43a05f319cbf2e9cd1233ba9ff57e",
    "id": null,
    "metadata": {},
    "name": "RelayPublishQueueTest3Query",
    "operationKind": "query",
    "text": "query RelayPublishQueueTest3Query {\n  me {\n    screennames {\n      name\n    }\n    id\n  }\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "71faac0d936629842d85fea159fe03cf";
}

module.exports = node;
