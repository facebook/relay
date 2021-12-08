/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<29ea480f8d5098acae4ce2c221ed4418>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayPublishQueueTest7Query$variables = {||};
export type RelayPublishQueueTest7QueryVariables = RelayPublishQueueTest7Query$variables;
export type RelayPublishQueueTest7Query$data = {|
  +me: ?{|
    +name: ?string,
  |},
|};
export type RelayPublishQueueTest7QueryResponse = RelayPublishQueueTest7Query$data;
export type RelayPublishQueueTest7Query = {|
  variables: RelayPublishQueueTest7QueryVariables,
  response: RelayPublishQueueTest7Query$data,
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
    "name": "RelayPublishQueueTest7Query",
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
    "name": "RelayPublishQueueTest7Query",
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
    "cacheID": "f2b316129429a4efe7cf72469f09e545",
    "id": null,
    "metadata": {},
    "name": "RelayPublishQueueTest7Query",
    "operationKind": "query",
    "text": "query RelayPublishQueueTest7Query {\n  me {\n    name\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "e529dfa451454408075001647c6784a5";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayPublishQueueTest7Query$variables,
  RelayPublishQueueTest7Query$data,
>*/);
