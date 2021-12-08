/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<d29966d3ae726c72066e07a8c4dbedb8>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type useQueryLoaderReactDoubleEffectsTestUserFragment$fragmentType = any;
export type useQueryLoaderReactDoubleEffectsTestQuery$variables = {|
  id?: ?string,
|};
export type useQueryLoaderReactDoubleEffectsTestQueryVariables = useQueryLoaderReactDoubleEffectsTestQuery$variables;
export type useQueryLoaderReactDoubleEffectsTestQuery$data = {|
  +node: ?{|
    +id: string,
    +name: ?string,
    +$fragmentSpreads: useQueryLoaderReactDoubleEffectsTestUserFragment$fragmentType,
  |},
|};
export type useQueryLoaderReactDoubleEffectsTestQueryResponse = useQueryLoaderReactDoubleEffectsTestQuery$data;
export type useQueryLoaderReactDoubleEffectsTestQuery = {|
  variables: useQueryLoaderReactDoubleEffectsTestQueryVariables,
  response: useQueryLoaderReactDoubleEffectsTestQuery$data,
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
    "name": "useQueryLoaderReactDoubleEffectsTestQuery",
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
            "name": "useQueryLoaderReactDoubleEffectsTestUserFragment"
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
    "name": "useQueryLoaderReactDoubleEffectsTestQuery",
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
    "cacheID": "d127812f0e547204b6455301956a3794",
    "id": null,
    "metadata": {},
    "name": "useQueryLoaderReactDoubleEffectsTestQuery",
    "operationKind": "query",
    "text": "query useQueryLoaderReactDoubleEffectsTestQuery(\n  $id: ID\n) {\n  node(id: $id) {\n    __typename\n    id\n    name\n    ...useQueryLoaderReactDoubleEffectsTestUserFragment\n  }\n}\n\nfragment useQueryLoaderReactDoubleEffectsTestUserFragment on User {\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "813ed6f6be85c7ddc56659a2312f6190";
}

module.exports = ((node/*: any*/)/*: Query<
  useQueryLoaderReactDoubleEffectsTestQuery$variables,
  useQueryLoaderReactDoubleEffectsTestQuery$data,
>*/);
