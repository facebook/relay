/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<b400ea52ff66abc1039f1e05d34a2172>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayConcreteVariablesTest1Query$variables = {|
  id: string,
|};
export type RelayConcreteVariablesTest1QueryVariables = RelayConcreteVariablesTest1Query$variables;
export type RelayConcreteVariablesTest1Query$data = {|
  +node: ?{|
    +id: string,
  |},
|};
export type RelayConcreteVariablesTest1QueryResponse = RelayConcreteVariablesTest1Query$data;
export type RelayConcreteVariablesTest1Query = {|
  variables: RelayConcreteVariablesTest1QueryVariables,
  response: RelayConcreteVariablesTest1Query$data,
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
    "name": "RelayConcreteVariablesTest1Query",
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
    "name": "RelayConcreteVariablesTest1Query",
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
    "cacheID": "089ec4e97d6d54fc7bd112b31140f54e",
    "id": null,
    "metadata": {},
    "name": "RelayConcreteVariablesTest1Query",
    "operationKind": "query",
    "text": "query RelayConcreteVariablesTest1Query(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "1e4569204e89dbf37024f9136e6f5004";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayConcreteVariablesTest1Query$variables,
  RelayConcreteVariablesTest1Query$data,
>*/);
