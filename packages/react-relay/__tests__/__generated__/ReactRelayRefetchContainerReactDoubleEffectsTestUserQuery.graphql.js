/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<487ca659e859dc2f0d25c7c10580f904>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { ReactRelayRefetchContainerReactDoubleEffectsTestUserFragment$fragmentType } from "./ReactRelayRefetchContainerReactDoubleEffectsTestUserFragment.graphql";
export type ReactRelayRefetchContainerReactDoubleEffectsTestUserQuery$variables = {|
  id: string,
|};
export type ReactRelayRefetchContainerReactDoubleEffectsTestUserQuery$data = {|
  +node: ?{|
    +$fragmentSpreads: ReactRelayRefetchContainerReactDoubleEffectsTestUserFragment$fragmentType,
  |},
|};
export type ReactRelayRefetchContainerReactDoubleEffectsTestUserQuery = {|
  response: ReactRelayRefetchContainerReactDoubleEffectsTestUserQuery$data,
  variables: ReactRelayRefetchContainerReactDoubleEffectsTestUserQuery$variables,
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
    "name": "ReactRelayRefetchContainerReactDoubleEffectsTestUserQuery",
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
            "name": "ReactRelayRefetchContainerReactDoubleEffectsTestUserFragment"
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
    "name": "ReactRelayRefetchContainerReactDoubleEffectsTestUserQuery",
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
    "cacheID": "78ef32eb81300888678ac59bb907b527",
    "id": null,
    "metadata": {},
    "name": "ReactRelayRefetchContainerReactDoubleEffectsTestUserQuery",
    "operationKind": "query",
    "text": "query ReactRelayRefetchContainerReactDoubleEffectsTestUserQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...ReactRelayRefetchContainerReactDoubleEffectsTestUserFragment\n    id\n  }\n}\n\nfragment ReactRelayRefetchContainerReactDoubleEffectsTestUserFragment on User {\n  id\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "88ddbf011c327ab1ad2e4ff9ab9012e7";
}

module.exports = ((node/*: any*/)/*: Query<
  ReactRelayRefetchContainerReactDoubleEffectsTestUserQuery$variables,
  ReactRelayRefetchContainerReactDoubleEffectsTestUserQuery$data,
>*/);
