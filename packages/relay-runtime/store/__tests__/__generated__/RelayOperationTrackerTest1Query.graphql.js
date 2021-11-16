/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<0cabff0f3b832e2f5ee85e78b1cbcb45>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayOperationTrackerTest1Query$variables = {|
  id?: ?string,
|};
export type RelayOperationTrackerTest1QueryVariables = RelayOperationTrackerTest1Query$variables;
export type RelayOperationTrackerTest1Query$data = {|
  +node: ?{|
    +id: string,
  |},
|};
export type RelayOperationTrackerTest1QueryResponse = RelayOperationTrackerTest1Query$data;
export type RelayOperationTrackerTest1Query = {|
  variables: RelayOperationTrackerTest1QueryVariables,
  response: RelayOperationTrackerTest1Query$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayOperationTrackerTest1Query",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v2/*: any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RelayOperationTrackerTest1Query",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "__typename",
            "storageKey": null
          },
          (v2/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "4e1cf614448bd80df0832edc8e552d0d",
    "id": null,
    "metadata": {},
    "name": "RelayOperationTrackerTest1Query",
    "operationKind": "query",
    "text": "query RelayOperationTrackerTest1Query(\n  $id: ID\n) {\n  node(id: $id) {\n    __typename\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "d7ac241162d417e0fd7a5104a17437b0";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayOperationTrackerTest1Query$variables,
  RelayOperationTrackerTest1Query$data,
>*/);
