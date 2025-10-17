/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<2c1550fbf1fa51b29f525bd1a98bb22a>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayModernEnvironmentExecuteWithDeferTestUserOverlappingFieldsFragment$fragmentType } from "./RelayModernEnvironmentExecuteWithDeferTestUserOverlappingFieldsFragment.graphql";
export type RelayModernEnvironmentExecuteWithDeferTestUserOverlappingFieldsQuery$variables = {|
  id: string,
|};
export type RelayModernEnvironmentExecuteWithDeferTestUserOverlappingFieldsQuery$data = {|
  +node: ?{|
    +id?: string,
    +name?: ?string,
    +$fragmentSpreads: RelayModernEnvironmentExecuteWithDeferTestUserOverlappingFieldsFragment$fragmentType,
  |},
|};
export type RelayModernEnvironmentExecuteWithDeferTestUserOverlappingFieldsQuery = {|
  response: RelayModernEnvironmentExecuteWithDeferTestUserOverlappingFieldsQuery$data,
  variables: RelayModernEnvironmentExecuteWithDeferTestUserOverlappingFieldsQuery$variables,
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
    "name": "RelayModernEnvironmentExecuteWithDeferTestUserOverlappingFieldsQuery",
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
            "kind": "InlineFragment",
            "selections": [
              (v2/*: any*/),
              (v3/*: any*/),
              {
                "kind": "Defer",
                "selections": [
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "RelayModernEnvironmentExecuteWithDeferTestUserOverlappingFieldsFragment"
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
    "name": "RelayModernEnvironmentExecuteWithDeferTestUserOverlappingFieldsQuery",
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
              (v3/*: any*/),
              {
                "if": null,
                "kind": "Defer",
                "label": "RelayModernEnvironmentExecuteWithDeferTestUserOverlappingFieldsQuery$defer$UserFragment",
                "selections": [
                  (v3/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "alternate_name",
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
    "cacheID": "150c805d7ab6cb953478bbca42153914",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentExecuteWithDeferTestUserOverlappingFieldsQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentExecuteWithDeferTestUserOverlappingFieldsQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ... on User {\n      id\n      name\n      ...RelayModernEnvironmentExecuteWithDeferTestUserOverlappingFieldsFragment @defer(label: \"RelayModernEnvironmentExecuteWithDeferTestUserOverlappingFieldsQuery$defer$UserFragment\")\n    }\n    id\n  }\n}\n\nfragment RelayModernEnvironmentExecuteWithDeferTestUserOverlappingFieldsFragment on User {\n  name\n  alternate_name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "1f182021a1007be8f8754165458d6768";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentExecuteWithDeferTestUserOverlappingFieldsQuery$variables,
  RelayModernEnvironmentExecuteWithDeferTestUserOverlappingFieldsQuery$data,
>*/);
