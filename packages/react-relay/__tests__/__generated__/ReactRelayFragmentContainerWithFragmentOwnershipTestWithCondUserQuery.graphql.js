/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<120cf8f51f6d6d2edd849f47f31ea3e1>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type ReactRelayFragmentContainerWithFragmentOwnershipTestUserFragment$fragmentType = any;
export type ReactRelayFragmentContainerWithFragmentOwnershipTestWithCondUserQuery$variables = {|
  id: string,
  condGlobal: boolean,
|};
export type ReactRelayFragmentContainerWithFragmentOwnershipTestWithCondUserQueryVariables = ReactRelayFragmentContainerWithFragmentOwnershipTestWithCondUserQuery$variables;
export type ReactRelayFragmentContainerWithFragmentOwnershipTestWithCondUserQuery$data = {|
  +node: ?{|
    +$fragmentSpreads: ReactRelayFragmentContainerWithFragmentOwnershipTestUserFragment$fragmentType,
  |},
|};
export type ReactRelayFragmentContainerWithFragmentOwnershipTestWithCondUserQueryResponse = ReactRelayFragmentContainerWithFragmentOwnershipTestWithCondUserQuery$data;
export type ReactRelayFragmentContainerWithFragmentOwnershipTestWithCondUserQuery = {|
  variables: ReactRelayFragmentContainerWithFragmentOwnershipTestWithCondUserQueryVariables,
  response: ReactRelayFragmentContainerWithFragmentOwnershipTestWithCondUserQuery$data,
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
    "name": "ReactRelayFragmentContainerWithFragmentOwnershipTestWithCondUserQuery",
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
            "name": "ReactRelayFragmentContainerWithFragmentOwnershipTestUserFragment"
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
    "name": "ReactRelayFragmentContainerWithFragmentOwnershipTestWithCondUserQuery",
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
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "username",
                "storageKey": null
              },
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
    "cacheID": "9774bee9826865073581222686c84e73",
    "id": null,
    "metadata": {},
    "name": "ReactRelayFragmentContainerWithFragmentOwnershipTestWithCondUserQuery",
    "operationKind": "query",
    "text": "query ReactRelayFragmentContainerWithFragmentOwnershipTestWithCondUserQuery(\n  $id: ID!\n  $condGlobal: Boolean!\n) {\n  node(id: $id) {\n    __typename\n    ...ReactRelayFragmentContainerWithFragmentOwnershipTestUserFragment_1jD3FU\n    id\n  }\n}\n\nfragment ReactRelayFragmentContainerWithFragmentOwnershipTestNestedUserFragment on User {\n  username\n}\n\nfragment ReactRelayFragmentContainerWithFragmentOwnershipTestUserFragment_1jD3FU on User {\n  id\n  name @include(if: $condGlobal)\n  ...ReactRelayFragmentContainerWithFragmentOwnershipTestNestedUserFragment\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "577a07568a7abf3e31c0e6f44fb64a8d";
}

module.exports = ((node/*: any*/)/*: Query<
  ReactRelayFragmentContainerWithFragmentOwnershipTestWithCondUserQuery$variables,
  ReactRelayFragmentContainerWithFragmentOwnershipTestWithCondUserQuery$data,
>*/);
