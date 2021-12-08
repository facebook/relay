/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<a4a0d6a15819bb930fb8c73246926d0d>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type loadQuerySourceBehaviorTestQuery$variables = {|
  id: string,
|};
export type loadQuerySourceBehaviorTestQueryVariables = loadQuerySourceBehaviorTestQuery$variables;
export type loadQuerySourceBehaviorTestQuery$data = {|
  +node: ?{|
    +id: string,
  |},
|};
export type loadQuerySourceBehaviorTestQueryResponse = loadQuerySourceBehaviorTestQuery$data;
export type loadQuerySourceBehaviorTestQuery = {|
  variables: loadQuerySourceBehaviorTestQueryVariables,
  response: loadQuerySourceBehaviorTestQuery$data,
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
    "name": "loadQuerySourceBehaviorTestQuery",
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
    "name": "loadQuerySourceBehaviorTestQuery",
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
    "cacheID": "b7648fd179cea9e6118ffb7129bdb05c",
    "id": null,
    "metadata": {},
    "name": "loadQuerySourceBehaviorTestQuery",
    "operationKind": "query",
    "text": "query loadQuerySourceBehaviorTestQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "c88d2ce9a02241ff654cc6feeb95ae05";
}

module.exports = ((node/*: any*/)/*: Query<
  loadQuerySourceBehaviorTestQuery$variables,
  loadQuerySourceBehaviorTestQuery$data,
>*/);
