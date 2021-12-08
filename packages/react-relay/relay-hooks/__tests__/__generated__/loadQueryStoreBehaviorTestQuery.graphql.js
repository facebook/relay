/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<7c0674ebcb66e646d0c66b5d6e3d7c78>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type loadQueryStoreBehaviorTestQuery$variables = {|
  id: string,
|};
export type loadQueryStoreBehaviorTestQueryVariables = loadQueryStoreBehaviorTestQuery$variables;
export type loadQueryStoreBehaviorTestQuery$data = {|
  +node: ?{|
    +name: ?string,
    +id: string,
  |},
|};
export type loadQueryStoreBehaviorTestQueryResponse = loadQueryStoreBehaviorTestQuery$data;
export type loadQueryStoreBehaviorTestQuery = {|
  variables: loadQueryStoreBehaviorTestQueryVariables,
  response: loadQueryStoreBehaviorTestQuery$data,
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
  "name": "name",
  "storageKey": null
},
v3 = {
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
    "name": "loadQueryStoreBehaviorTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/)
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
    "name": "loadQueryStoreBehaviorTestQuery",
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
          (v2/*: any*/),
          (v3/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "5029789f6ab275e452e40f8556922431",
    "id": null,
    "metadata": {},
    "name": "loadQueryStoreBehaviorTestQuery",
    "operationKind": "query",
    "text": "query loadQueryStoreBehaviorTestQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    name\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "cf2ac1f2d1bee4875f0ed5be74fc175e";
}

module.exports = ((node/*: any*/)/*: Query<
  loadQueryStoreBehaviorTestQuery$variables,
  loadQueryStoreBehaviorTestQuery$data,
>*/);
