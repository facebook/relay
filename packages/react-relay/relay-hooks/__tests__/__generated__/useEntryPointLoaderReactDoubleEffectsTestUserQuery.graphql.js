/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<a7b779cf3ca32d891511aaa2ccb2ab1e>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { useEntryPointLoaderReactDoubleEffectsTestUserFragment$fragmentType } from "./useEntryPointLoaderReactDoubleEffectsTestUserFragment.graphql";
export type useEntryPointLoaderReactDoubleEffectsTestUserQuery$variables = {|
  id?: ?string,
|};
export type useEntryPointLoaderReactDoubleEffectsTestUserQuery$data = {|
  +node: ?{|
    +id: string,
    +name: ?string,
    +$fragmentSpreads: useEntryPointLoaderReactDoubleEffectsTestUserFragment$fragmentType,
  |},
|};
export type useEntryPointLoaderReactDoubleEffectsTestUserQuery = {|
  response: useEntryPointLoaderReactDoubleEffectsTestUserQuery$data,
  variables: useEntryPointLoaderReactDoubleEffectsTestUserQuery$variables,
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
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "useEntryPointLoaderReactDoubleEffectsTestUserQuery",
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
          (v3/*: any*/),
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "useEntryPointLoaderReactDoubleEffectsTestUserFragment"
          }
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
    "name": "useEntryPointLoaderReactDoubleEffectsTestUserQuery",
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
    "cacheID": "a262483e4a3d40669d869c30b3d4934b",
    "id": null,
    "metadata": {},
    "name": "useEntryPointLoaderReactDoubleEffectsTestUserQuery",
    "operationKind": "query",
    "text": "query useEntryPointLoaderReactDoubleEffectsTestUserQuery(\n  $id: ID\n) {\n  node(id: $id) {\n    __typename\n    id\n    name\n    ...useEntryPointLoaderReactDoubleEffectsTestUserFragment\n  }\n}\n\nfragment useEntryPointLoaderReactDoubleEffectsTestUserFragment on User {\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "6b7f3606d43827b1210a7de7c6a81556";
}

module.exports = ((node/*: any*/)/*: Query<
  useEntryPointLoaderReactDoubleEffectsTestUserQuery$variables,
  useEntryPointLoaderReactDoubleEffectsTestUserQuery$data,
>*/);
