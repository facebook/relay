/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<a2cfc3c784aaabafcb7c610bee2b25ad>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type useQueryLoaderMultipleCallsTestQuery$variables = {|
  id: string,
|};
export type useQueryLoaderMultipleCallsTestQueryVariables = useQueryLoaderMultipleCallsTestQuery$variables;
export type useQueryLoaderMultipleCallsTestQuery$data = {|
  +node: ?{|
    +id: string,
  |},
|};
export type useQueryLoaderMultipleCallsTestQueryResponse = useQueryLoaderMultipleCallsTestQuery$data;
export type useQueryLoaderMultipleCallsTestQuery = {|
  variables: useQueryLoaderMultipleCallsTestQueryVariables,
  response: useQueryLoaderMultipleCallsTestQuery$data,
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
    "name": "useQueryLoaderMultipleCallsTestQuery",
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
    "name": "useQueryLoaderMultipleCallsTestQuery",
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
    "cacheID": "092b162a102d69116e0d28ba26bdb15f",
    "id": null,
    "metadata": {},
    "name": "useQueryLoaderMultipleCallsTestQuery",
    "operationKind": "query",
    "text": "query useQueryLoaderMultipleCallsTestQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "83dbf5a0d9545095fdb85f7ed368e897";
}

module.exports = ((node/*: any*/)/*: Query<
  useQueryLoaderMultipleCallsTestQuery$variables,
  useQueryLoaderMultipleCallsTestQuery$data,
>*/);
