/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<9ad506114da6a9b8e1ee90ab9f087ff2>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type useFragmentNodeTestMissingDataQuery$variables = {|
  id: string,
|};
export type useFragmentNodeTestMissingDataQuery$data = {|
  +node: ?{|
    +__typename: string,
    +id: string,
  |},
|};
export type useFragmentNodeTestMissingDataQuery = {|
  response: useFragmentNodeTestMissingDataQuery$data,
  variables: useFragmentNodeTestMissingDataQuery$variables,
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
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "id",
        "variableName": "id"
      }
    ],
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
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "useFragmentNodeTestMissingDataQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "useFragmentNodeTestMissingDataQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "063b789551d70e9aadd37ca566f782f9",
    "id": null,
    "metadata": {},
    "name": "useFragmentNodeTestMissingDataQuery",
    "operationKind": "query",
    "text": "query useFragmentNodeTestMissingDataQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "1dcf14ee1f80ff2932ca602b16172ce2";
}

module.exports = ((node/*: any*/)/*: Query<
  useFragmentNodeTestMissingDataQuery$variables,
  useFragmentNodeTestMissingDataQuery$data,
>*/);
