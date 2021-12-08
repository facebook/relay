/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<c3bbffb56f31697456df7f9991776731>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayPublishQueueTest5Query$variables = {||};
export type RelayPublishQueueTest5QueryVariables = RelayPublishQueueTest5Query$variables;
export type RelayPublishQueueTest5Query$data = {|
  +me: ?{|
    +name: ?string,
  |},
|};
export type RelayPublishQueueTest5QueryResponse = RelayPublishQueueTest5Query$data;
export type RelayPublishQueueTest5Query = {|
  variables: RelayPublishQueueTest5QueryVariables,
  response: RelayPublishQueueTest5Query$data,
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
    "name": "RelayPublishQueueTest5Query",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          (v0/*: any*/)
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
    "name": "RelayPublishQueueTest5Query",
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
    "cacheID": "13f11d95613bc3439d2e23ba98f82671",
    "id": null,
    "metadata": {},
    "name": "RelayPublishQueueTest5Query",
    "operationKind": "query",
    "text": "query RelayPublishQueueTest5Query {\n  me {\n    name\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "18ed083c255b6858fb59c74c5bb22f05";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayPublishQueueTest5Query$variables,
  RelayPublishQueueTest5Query$data,
>*/);
