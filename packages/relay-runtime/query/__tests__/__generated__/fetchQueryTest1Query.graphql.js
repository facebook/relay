/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<d338bf721acbf80e136d7e3436e9f916>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type fetchQueryTest1Query$variables = {|
  id: string,
|};
export type fetchQueryTest1QueryVariables = fetchQueryTest1Query$variables;
export type fetchQueryTest1Query$data = {|
  +node: ?{|
    +id: string,
  |},
|};
export type fetchQueryTest1QueryResponse = fetchQueryTest1Query$data;
export type fetchQueryTest1Query = {|
  variables: fetchQueryTest1QueryVariables,
  response: fetchQueryTest1Query$data,
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
    "name": "fetchQueryTest1Query",
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
    "name": "fetchQueryTest1Query",
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
    "cacheID": "81abf0e7630543458b41a1a127fc1be4",
    "id": null,
    "metadata": {},
    "name": "fetchQueryTest1Query",
    "operationKind": "query",
    "text": "query fetchQueryTest1Query(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "98e1b7d40f95aa45abe566e9b10b55f0";
}

module.exports = ((node/*: any*/)/*: Query<
  fetchQueryTest1Query$variables,
  fetchQueryTest1Query$data,
>*/);
