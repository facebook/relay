/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<79ecb1b048e17b2eace4b8e1de9ef060>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type useFragmentNodeReactDoubleEffectsTestUserFragment$fragmentType = any;
export type useFragmentNodeReactDoubleEffectsTestUserQuery$variables = {|
  id: string,
|};
export type useFragmentNodeReactDoubleEffectsTestUserQueryVariables = useFragmentNodeReactDoubleEffectsTestUserQuery$variables;
export type useFragmentNodeReactDoubleEffectsTestUserQuery$data = {|
  +node: ?{|
    +$fragmentSpreads: useFragmentNodeReactDoubleEffectsTestUserFragment$fragmentType,
  |},
|};
export type useFragmentNodeReactDoubleEffectsTestUserQueryResponse = useFragmentNodeReactDoubleEffectsTestUserQuery$data;
export type useFragmentNodeReactDoubleEffectsTestUserQuery = {|
  variables: useFragmentNodeReactDoubleEffectsTestUserQueryVariables,
  response: useFragmentNodeReactDoubleEffectsTestUserQuery$data,
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
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "useFragmentNodeReactDoubleEffectsTestUserQuery",
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
            "args": null,
            "kind": "FragmentSpread",
            "name": "useFragmentNodeReactDoubleEffectsTestUserFragment"
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
    "name": "useFragmentNodeReactDoubleEffectsTestUserQuery",
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
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          },
          {
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
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "ad32d00e96f97a37e4ac2aa398dadbb7",
    "id": null,
    "metadata": {},
    "name": "useFragmentNodeReactDoubleEffectsTestUserQuery",
    "operationKind": "query",
    "text": "query useFragmentNodeReactDoubleEffectsTestUserQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...useFragmentNodeReactDoubleEffectsTestUserFragment\n    id\n  }\n}\n\nfragment useFragmentNodeReactDoubleEffectsTestUserFragment on User {\n  id\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "362966f1b2b2a5e926134b5ad581e901";
}

module.exports = ((node/*: any*/)/*: Query<
  useFragmentNodeReactDoubleEffectsTestUserQuery$variables,
  useFragmentNodeReactDoubleEffectsTestUserQuery$data,
>*/);
