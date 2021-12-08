/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<4169ae4cb7a94c1ada0957e5774fe739>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type useEntryPointLoaderReactDoubleEffectsTestUserFragment$fragmentType = any;
export type useEntryPointLoaderReactDoubleEffectsTestUserQuery$variables = {|
  id?: ?string,
|};
export type useEntryPointLoaderReactDoubleEffectsTestUserQueryVariables = useEntryPointLoaderReactDoubleEffectsTestUserQuery$variables;
export type useEntryPointLoaderReactDoubleEffectsTestUserQuery$data = {|
  +node: ?{|
    +id: string,
    +name: ?string,
    +$fragmentSpreads: useEntryPointLoaderReactDoubleEffectsTestUserFragment$fragmentType,
  |},
|};
export type useEntryPointLoaderReactDoubleEffectsTestUserQueryResponse = useEntryPointLoaderReactDoubleEffectsTestUserQuery$data;
export type useEntryPointLoaderReactDoubleEffectsTestUserQuery = {|
  variables: useEntryPointLoaderReactDoubleEffectsTestUserQueryVariables,
  response: useEntryPointLoaderReactDoubleEffectsTestUserQuery$data,
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
  (node/*: any*/).hash = "d296fc0f253f3d0b6940f48b0e01845e";
}

module.exports = ((node/*: any*/)/*: Query<
  useEntryPointLoaderReactDoubleEffectsTestUserQuery$variables,
  useEntryPointLoaderReactDoubleEffectsTestUserQuery$data,
>*/);
