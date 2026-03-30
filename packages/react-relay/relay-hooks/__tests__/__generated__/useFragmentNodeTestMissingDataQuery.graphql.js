/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<97c44737b6ef5995d7c7093872a61b7e>>
 * @flow
 * @lightSyntaxTransform
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
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "useFragmentNodeTestMissingDataQuery",
    "selections": (v1/*:: as any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "useFragmentNodeTestMissingDataQuery",
    "selections": (v1/*:: as any*/)
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
  (node/*:: as any*/).hash = "1dcf14ee1f80ff2932ca602b16172ce2";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  useFragmentNodeTestMissingDataQuery$variables,
  useFragmentNodeTestMissingDataQuery$data,
>*/);
