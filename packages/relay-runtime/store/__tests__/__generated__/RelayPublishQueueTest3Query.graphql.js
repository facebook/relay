/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<2cd20b9fbb797dbd1b3eda9b5849371f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayPublishQueueTest3Query$variables = {||};
export type RelayPublishQueueTest3Query$data = {|
  +me: ?{|
    +screennames: ?ReadonlyArray<?{|
      +name: ?string,
    |}>,
  |},
|};
export type RelayPublishQueueTest3Query = {|
  response: RelayPublishQueueTest3Query$data,
  variables: RelayPublishQueueTest3Query$variables,
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

module.exports = ((node/*: any*/)/*: Query<
  RelayPublishQueueTest3Query$variables,
  RelayPublishQueueTest3Query$data,
>*/);
