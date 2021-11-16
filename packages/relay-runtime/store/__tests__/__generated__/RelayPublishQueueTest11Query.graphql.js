/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<3b13ac6f2b552acbf6a1136b6c9a80fe>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayPublishQueueTest11Query$variables = {||};
export type RelayPublishQueueTest11QueryVariables = RelayPublishQueueTest11Query$variables;
export type RelayPublishQueueTest11Query$data = {|
  +me: ?{|
    +name: ?string,
  |},
|};
export type RelayPublishQueueTest11QueryResponse = RelayPublishQueueTest11Query$data;
export type RelayPublishQueueTest11Query = {|
  variables: RelayPublishQueueTest11QueryVariables,
  response: RelayPublishQueueTest11Query$data,
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
    "name": "RelayPublishQueueTest11Query",
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
    "name": "RelayPublishQueueTest11Query",
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
    "cacheID": "790149e13cdb0e2494c0dfccc5215726",
    "id": null,
    "metadata": {},
    "name": "RelayPublishQueueTest11Query",
    "operationKind": "query",
    "text": "query RelayPublishQueueTest11Query {\n  me {\n    name\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "1cc0d273a8fed868457065c7eb33d35c";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayPublishQueueTest11Query$variables,
  RelayPublishQueueTest11Query$data,
>*/);
