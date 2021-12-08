/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<3171f96b046dd161c93ca9a73ff89494>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayPublishQueueTest6Query$variables = {||};
export type RelayPublishQueueTest6QueryVariables = RelayPublishQueueTest6Query$variables;
export type RelayPublishQueueTest6Query$data = {|
  +me: ?{|
    +name: ?string,
  |},
|};
export type RelayPublishQueueTest6QueryResponse = RelayPublishQueueTest6Query$data;
export type RelayPublishQueueTest6Query = {|
  variables: RelayPublishQueueTest6QueryVariables,
  response: RelayPublishQueueTest6Query$data,
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
    "name": "RelayPublishQueueTest6Query",
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
    "name": "RelayPublishQueueTest6Query",
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
    "cacheID": "d9a888ef0573d218e7b605b774075d43",
    "id": null,
    "metadata": {},
    "name": "RelayPublishQueueTest6Query",
    "operationKind": "query",
    "text": "query RelayPublishQueueTest6Query {\n  me {\n    name\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "995ca39ae8c20ede1b1bab43af698550";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayPublishQueueTest6Query$variables,
  RelayPublishQueueTest6Query$data,
>*/);
