/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<3ebdf5c8c0704e54c968684bbe56fa56>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type usePreloadedQueryTestQuery$variables = {|
  id: string,
|};
export type usePreloadedQueryTestQueryVariables = usePreloadedQueryTestQuery$variables;
export type usePreloadedQueryTestQuery$data = {|
  +node: ?{|
    +id: string,
    +name?: ?string,
  |},
|};
export type usePreloadedQueryTestQueryResponse = usePreloadedQueryTestQuery$data;
export type usePreloadedQueryTestQuery = {|
  variables: usePreloadedQueryTestQueryVariables,
  response: usePreloadedQueryTestQuery$data,
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
},
v3 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "usePreloadedQueryTestQuery",
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
    "name": "usePreloadedQueryTestQuery",
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
    "cacheID": "4dd8607a7f08b0179a6f774a6d3b9675",
    "id": null,
    "metadata": {},
    "name": "usePreloadedQueryTestQuery",
    "operationKind": "query",
    "text": "query usePreloadedQueryTestQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    id\n    ... on User {\n      name\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "7957e9c42a4dbad04f1c2fc97aed3bed";
}

module.exports = ((node/*: any*/)/*: Query<
  usePreloadedQueryTestQuery$variables,
  usePreloadedQueryTestQuery$data,
>*/);
