/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<69d8411257601e1142fecb6b2c50b44a>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { ReactRelayFragmentContainerReactDoubleEffectsTestUserFragment$fragmentType } from "./ReactRelayFragmentContainerReactDoubleEffectsTestUserFragment.graphql";
export type ReactRelayFragmentContainerReactDoubleEffectsTestUserQuery$variables = {|
  id: string,
|};
export type ReactRelayFragmentContainerReactDoubleEffectsTestUserQuery$data = {|
  +node: ?{|
    +$fragmentSpreads: ReactRelayFragmentContainerReactDoubleEffectsTestUserFragment$fragmentType,
  |},
|};
export type ReactRelayFragmentContainerReactDoubleEffectsTestUserQuery = {|
  response: ReactRelayFragmentContainerReactDoubleEffectsTestUserQuery$data,
  variables: ReactRelayFragmentContainerReactDoubleEffectsTestUserQuery$variables,
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
    "name": "ReactRelayFragmentContainerReactDoubleEffectsTestUserQuery",
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
            "name": "ReactRelayFragmentContainerReactDoubleEffectsTestUserFragment"
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
    "name": "ReactRelayFragmentContainerReactDoubleEffectsTestUserQuery",
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
    "cacheID": "f4a7846a0a9fc6d4290e9e760a0b0cbb",
    "id": null,
    "metadata": {},
    "name": "ReactRelayFragmentContainerReactDoubleEffectsTestUserQuery",
    "operationKind": "query",
    "text": "query ReactRelayFragmentContainerReactDoubleEffectsTestUserQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...ReactRelayFragmentContainerReactDoubleEffectsTestUserFragment\n    id\n  }\n}\n\nfragment ReactRelayFragmentContainerReactDoubleEffectsTestUserFragment on User {\n  id\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "2267a7b5958025ee93de3427d77a90ac";
}

module.exports = ((node/*: any*/)/*: Query<
  ReactRelayFragmentContainerReactDoubleEffectsTestUserQuery$variables,
  ReactRelayFragmentContainerReactDoubleEffectsTestUserQuery$data,
>*/);
