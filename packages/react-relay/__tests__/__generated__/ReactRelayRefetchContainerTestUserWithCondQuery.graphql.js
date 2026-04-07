/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<6d1474c9a5b1e78d32358366b6ff7031>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { ReactRelayRefetchContainerTestUserFragment$fragmentType } from "./ReactRelayRefetchContainerTestUserFragment.graphql";
export type ReactRelayRefetchContainerTestUserWithCondQuery$variables = {|
  condGlobal: boolean,
  id: string,
|};
export type ReactRelayRefetchContainerTestUserWithCondQuery$data = {|
  +node: ?{|
    +$fragmentSpreads: ReactRelayRefetchContainerTestUserFragment$fragmentType,
  |},
|};
export type ReactRelayRefetchContainerTestUserWithCondQuery = {|
  response: ReactRelayRefetchContainerTestUserWithCondQuery$data,
  variables: ReactRelayRefetchContainerTestUserWithCondQuery$variables,
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
      (v0/*:: as any*/),
      (v1/*:: as any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "ReactRelayRefetchContainerTestUserWithCondQuery",
    "selections": [
      {
        "alias": null,
        "args": (v2/*:: as any*/),
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
            "name": "ReactRelayRefetchContainerTestUserFragment"
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
      (v1/*:: as any*/),
      (v0/*:: as any*/)
    ],
    "kind": "Operation",
    "name": "ReactRelayRefetchContainerTestUserWithCondQuery",
    "selections": [
      {
        "alias": null,
        "args": (v2/*:: as any*/),
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
    "cacheID": "1b333f7e7a646203ad3a4b04bee57b6a",
    "id": null,
    "metadata": {},
    "name": "ReactRelayRefetchContainerTestUserWithCondQuery",
    "operationKind": "query",
    "text": "query ReactRelayRefetchContainerTestUserWithCondQuery(\n  $id: ID!\n  $condGlobal: Boolean!\n) {\n  node(id: $id) {\n    __typename\n    ...ReactRelayRefetchContainerTestUserFragment_1jD3FU\n    id\n  }\n}\n\nfragment ReactRelayRefetchContainerTestUserFragment_1jD3FU on User {\n  id\n  name @include(if: $condGlobal)\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "5ead741f93728a15b610b870e2b420f2";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  ReactRelayRefetchContainerTestUserWithCondQuery$variables,
  ReactRelayRefetchContainerTestUserWithCondQuery$data,
>*/);
