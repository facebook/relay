/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<f6b64922b89fcec5972a32291d204c69>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type useLazyLoadQueryNodeReactDoubleEffectsTestUserFragment$fragmentType = any;
export type useLazyLoadQueryNodeReactDoubleEffectsTestUserQuery$variables = {|
  id?: ?string,
|};
export type useLazyLoadQueryNodeReactDoubleEffectsTestUserQueryVariables = useLazyLoadQueryNodeReactDoubleEffectsTestUserQuery$variables;
export type useLazyLoadQueryNodeReactDoubleEffectsTestUserQuery$data = {|
  +node: ?{|
    +id: string,
    +name: ?string,
    +$fragmentSpreads: useLazyLoadQueryNodeReactDoubleEffectsTestUserFragment$fragmentType,
  |},
|};
export type useLazyLoadQueryNodeReactDoubleEffectsTestUserQueryResponse = useLazyLoadQueryNodeReactDoubleEffectsTestUserQuery$data;
export type useLazyLoadQueryNodeReactDoubleEffectsTestUserQuery = {|
  variables: useLazyLoadQueryNodeReactDoubleEffectsTestUserQueryVariables,
  response: useLazyLoadQueryNodeReactDoubleEffectsTestUserQuery$data,
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
    "name": "useLazyLoadQueryNodeReactDoubleEffectsTestUserQuery",
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
            "name": "useLazyLoadQueryNodeReactDoubleEffectsTestUserFragment"
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
    "name": "useLazyLoadQueryNodeReactDoubleEffectsTestUserQuery",
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
          (v3/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "firstName",
                "storageKey": null
              }
            ],
            "type": "User",
            "abstractKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "69c5d9f579410cc156d55a5f7292f565",
    "id": null,
    "metadata": {},
    "name": "useLazyLoadQueryNodeReactDoubleEffectsTestUserQuery",
    "operationKind": "query",
    "text": "query useLazyLoadQueryNodeReactDoubleEffectsTestUserQuery(\n  $id: ID\n) {\n  node(id: $id) {\n    __typename\n    id\n    name\n    ...useLazyLoadQueryNodeReactDoubleEffectsTestUserFragment\n  }\n}\n\nfragment useLazyLoadQueryNodeReactDoubleEffectsTestUserFragment on User {\n  firstName\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "4f5221aaf962b9f3544c53ae0f65d8cd";
}

module.exports = ((node/*: any*/)/*: Query<
  useLazyLoadQueryNodeReactDoubleEffectsTestUserQuery$variables,
  useLazyLoadQueryNodeReactDoubleEffectsTestUserQuery$data,
>*/);
