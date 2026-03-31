/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<7c9643c09bbe8c5313d0eac6de8fadb0>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type LazyLoadEntryPointContainerDEEPRECATEDTestQuery$variables = {|
  id: string,
|};
export type LazyLoadEntryPointContainerDEEPRECATEDTestQuery$data = {|
  +node: ?{|
    +id: string,
    +name?: ?string,
  |},
|};
export type LazyLoadEntryPointContainerDEEPRECATEDTestQuery = {|
  response: LazyLoadEntryPointContainerDEEPRECATEDTestQuery$data,
  variables: LazyLoadEntryPointContainerDEEPRECATEDTestQuery$variables,
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
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "LazyLoadEntryPointContainerDEEPRECATEDTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v2/*:: as any*/),
          (v3/*:: as any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "LazyLoadEntryPointContainerDEEPRECATEDTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
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
          (v2/*:: as any*/),
          (v3/*:: as any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "9b8d2eab23ccc8e6a54476c783f0d3f4",
    "id": null,
    "metadata": {},
    "name": "LazyLoadEntryPointContainerDEEPRECATEDTestQuery",
    "operationKind": "query",
    "text": "query LazyLoadEntryPointContainerDEEPRECATEDTestQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    id\n    ... on User {\n      name\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "efb87d5ed867796ca922a529fb5256c7";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  LazyLoadEntryPointContainerDEEPRECATEDTestQuery$variables,
  LazyLoadEntryPointContainerDEEPRECATEDTestQuery$data,
>*/);
