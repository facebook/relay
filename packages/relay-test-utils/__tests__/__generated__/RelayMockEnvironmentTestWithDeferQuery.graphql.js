/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<578edc34d1829740f7c241a4e900b1c2>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayMockEnvironmentTestWithDeferFragment_user$fragmentType } from "./RelayMockEnvironmentTestWithDeferFragment_user.graphql";
export type RelayMockEnvironmentTestWithDeferQuery$variables = {|
  id: string,
|};
export type RelayMockEnvironmentTestWithDeferQuery$data = {|
  +node: ?{|
    +id: string,
    +$fragmentSpreads: RelayMockEnvironmentTestWithDeferFragment_user$fragmentType,
  |},
|};
export type RelayMockEnvironmentTestWithDeferQuery = {|
  response: RelayMockEnvironmentTestWithDeferQuery$data,
  variables: RelayMockEnvironmentTestWithDeferQuery$variables,
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
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayMockEnvironmentTestWithDeferQuery",
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
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "kind": "Defer",
                "selections": [
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "RelayMockEnvironmentTestWithDeferFragment_user"
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
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RelayMockEnvironmentTestWithDeferQuery",
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
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "if": null,
                "kind": "Defer",
                "label": "RelayMockEnvironmentTestWithDeferQuery$defer$RelayMockEnvironmentTestWithDeferFragment_user",
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
    "cacheID": "5f15611723acb35ba3ae949224bdb31a",
    "id": null,
    "metadata": {},
    "name": "RelayMockEnvironmentTestWithDeferQuery",
    "operationKind": "query",
    "text": "query RelayMockEnvironmentTestWithDeferQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    id\n    ... on User {\n      ...RelayMockEnvironmentTestWithDeferFragment_user @defer(label: \"RelayMockEnvironmentTestWithDeferQuery$defer$RelayMockEnvironmentTestWithDeferFragment_user\")\n    }\n  }\n}\n\nfragment RelayMockEnvironmentTestWithDeferFragment_user on User {\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "5d610ca536e5dc2be8f6c17b55cd8a75";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayMockEnvironmentTestWithDeferQuery$variables,
  RelayMockEnvironmentTestWithDeferQuery$data,
>*/);
