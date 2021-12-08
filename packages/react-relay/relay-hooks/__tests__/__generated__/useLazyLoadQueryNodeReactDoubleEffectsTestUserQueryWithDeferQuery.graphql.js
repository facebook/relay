/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<1a68a442c84f3a2001603b4e5c796726>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type useLazyLoadQueryNodeReactDoubleEffectsTestUserFragment$fragmentType = any;
export type useLazyLoadQueryNodeReactDoubleEffectsTestUserQueryWithDeferQuery$variables = {|
  id?: ?string,
|};
export type useLazyLoadQueryNodeReactDoubleEffectsTestUserQueryWithDeferQueryVariables = useLazyLoadQueryNodeReactDoubleEffectsTestUserQueryWithDeferQuery$variables;
export type useLazyLoadQueryNodeReactDoubleEffectsTestUserQueryWithDeferQuery$data = {|
  +node: ?{|
    +id: string,
    +name: ?string,
    +$fragmentSpreads: useLazyLoadQueryNodeReactDoubleEffectsTestUserFragment$fragmentType,
  |},
|};
export type useLazyLoadQueryNodeReactDoubleEffectsTestUserQueryWithDeferQueryResponse = useLazyLoadQueryNodeReactDoubleEffectsTestUserQueryWithDeferQuery$data;
export type useLazyLoadQueryNodeReactDoubleEffectsTestUserQueryWithDeferQuery = {|
  variables: useLazyLoadQueryNodeReactDoubleEffectsTestUserQueryWithDeferQueryVariables,
  response: useLazyLoadQueryNodeReactDoubleEffectsTestUserQueryWithDeferQuery$data,
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
    "name": "useLazyLoadQueryNodeReactDoubleEffectsTestUserQueryWithDeferQuery",
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
            "kind": "Defer",
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "useLazyLoadQueryNodeReactDoubleEffectsTestUserFragment"
              }
            ]
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
    "name": "useLazyLoadQueryNodeReactDoubleEffectsTestUserQueryWithDeferQuery",
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
            "if": null,
            "kind": "Defer",
            "label": "useLazyLoadQueryNodeReactDoubleEffectsTestUserQueryWithDeferQuery$defer$useLazyLoadQueryNodeReactDoubleEffectsTestUserFragment",
            "selections": [
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
            ]
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "24949dd00df70202822f15fe3ed87c7a",
    "id": null,
    "metadata": {},
    "name": "useLazyLoadQueryNodeReactDoubleEffectsTestUserQueryWithDeferQuery",
    "operationKind": "query",
    "text": "query useLazyLoadQueryNodeReactDoubleEffectsTestUserQueryWithDeferQuery(\n  $id: ID\n) {\n  node(id: $id) {\n    __typename\n    id\n    name\n    ...useLazyLoadQueryNodeReactDoubleEffectsTestUserFragment @defer(label: \"useLazyLoadQueryNodeReactDoubleEffectsTestUserQueryWithDeferQuery$defer$useLazyLoadQueryNodeReactDoubleEffectsTestUserFragment\")\n  }\n}\n\nfragment useLazyLoadQueryNodeReactDoubleEffectsTestUserFragment on User {\n  firstName\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "12d18891ad074f33e2e0064f4d26ebd2";
}

module.exports = ((node/*: any*/)/*: Query<
  useLazyLoadQueryNodeReactDoubleEffectsTestUserQueryWithDeferQuery$variables,
  useLazyLoadQueryNodeReactDoubleEffectsTestUserQueryWithDeferQuery$data,
>*/);
