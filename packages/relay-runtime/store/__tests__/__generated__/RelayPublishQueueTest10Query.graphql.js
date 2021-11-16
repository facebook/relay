/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<853af7ec990b093998a26899a0994778>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayPublishQueueTest10Query$variables = {||};
export type RelayPublishQueueTest10QueryVariables = RelayPublishQueueTest10Query$variables;
export type RelayPublishQueueTest10Query$data = {|
  +me: ?{|
    +name: ?string,
  |},
|};
export type RelayPublishQueueTest10QueryResponse = RelayPublishQueueTest10Query$data;
export type RelayPublishQueueTest10Query = {|
  variables: RelayPublishQueueTest10QueryVariables,
  response: RelayPublishQueueTest10Query$data,
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
    "name": "RelayPublishQueueTest10Query",
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
    "name": "RelayPublishQueueTest10Query",
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
    "cacheID": "7d66da1ad35013349c10677bf247a1da",
    "id": null,
    "metadata": {},
    "name": "RelayPublishQueueTest10Query",
    "operationKind": "query",
    "text": "query RelayPublishQueueTest10Query {\n  me {\n    name\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "6bafd37bd67c3927d63a3bf665c2fee8";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayPublishQueueTest10Query$variables,
  RelayPublishQueueTest10Query$data,
>*/);
