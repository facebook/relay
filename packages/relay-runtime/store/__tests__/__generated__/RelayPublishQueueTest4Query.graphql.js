/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<25c22e1c87907280117d6d78df612965>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayPublishQueueTest4Query$variables = {||};
export type RelayPublishQueueTest4QueryVariables = RelayPublishQueueTest4Query$variables;
export type RelayPublishQueueTest4Query$data = {|
  +me: ?{|
    +name: ?string,
  |},
|};
export type RelayPublishQueueTest4QueryResponse = RelayPublishQueueTest4Query$data;
export type RelayPublishQueueTest4Query = {|
  variables: RelayPublishQueueTest4QueryVariables,
  response: RelayPublishQueueTest4Query$data,
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
    "name": "RelayPublishQueueTest4Query",
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
    "name": "RelayPublishQueueTest4Query",
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
    "cacheID": "a1b8ad2c029b714011ff0cccf04bce6d",
    "id": null,
    "metadata": {},
    "name": "RelayPublishQueueTest4Query",
    "operationKind": "query",
    "text": "query RelayPublishQueueTest4Query {\n  me {\n    name\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "f432bd98dc2d275161d0cafc8100c3f7";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayPublishQueueTest4Query$variables,
  RelayPublishQueueTest4Query$data,
>*/);
