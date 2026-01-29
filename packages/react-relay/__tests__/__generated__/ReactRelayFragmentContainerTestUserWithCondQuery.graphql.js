/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<ff2d7f67ae2fd8de1f5945ad65596c22>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { ReactRelayFragmentContainerTestUserFragment$fragmentType } from "./ReactRelayFragmentContainerTestUserFragment.graphql";
export type ReactRelayFragmentContainerTestUserWithCondQuery$variables = {|
  condGlobal: boolean,
  id: string,
|};
export type ReactRelayFragmentContainerTestUserWithCondQuery$data = {|
  +node: ?{|
    +$fragmentSpreads: ReactRelayFragmentContainerTestUserFragment$fragmentType,
  |},
|};
export type ReactRelayFragmentContainerTestUserWithCondQuery = {|
  response: ReactRelayFragmentContainerTestUserWithCondQuery$data,
  variables: ReactRelayFragmentContainerTestUserWithCondQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "condGlobal"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "id"
},
v2 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "ReactRelayFragmentContainerTestUserWithCondQuery",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "args": [
              {
                "kind": "Variable",
                "name": "cond",
                "variableName": "condGlobal"
              }
            ],
            "kind": "FragmentSpread",
            "name": "ReactRelayFragmentContainerTestUserFragment"
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
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "ReactRelayFragmentContainerTestUserWithCondQuery",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
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
                "condition": "condGlobal",
                "kind": "Condition",
                "passingValue": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "name",
                    "storageKey": null
                  }
                ]
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
    "cacheID": "3e4ec48237b139b0d3f38f1ec4a98bb9",
    "id": null,
    "metadata": {},
    "name": "ReactRelayFragmentContainerTestUserWithCondQuery",
    "operationKind": "query",
    "text": "query ReactRelayFragmentContainerTestUserWithCondQuery(\n  $id: ID!\n  $condGlobal: Boolean!\n) {\n  node(id: $id) {\n    __typename\n    ...ReactRelayFragmentContainerTestUserFragment_1jD3FU\n    id\n  }\n}\n\nfragment ReactRelayFragmentContainerTestUserFragment_1jD3FU on User {\n  id\n  name @include(if: $condGlobal)\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "236716637f5e84cb62c420776a4d9838";
}

module.exports = ((node/*: any*/)/*: Query<
  ReactRelayFragmentContainerTestUserWithCondQuery$variables,
  ReactRelayFragmentContainerTestUserWithCondQuery$data,
>*/);
