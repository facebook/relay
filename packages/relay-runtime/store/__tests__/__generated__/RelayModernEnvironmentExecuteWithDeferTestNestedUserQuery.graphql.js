/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<aba44441e305f45978e190cd5da02b72>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayModernEnvironmentExecuteWithDeferTestNestedUserFragment$fragmentType } from "./RelayModernEnvironmentExecuteWithDeferTestNestedUserFragment.graphql";
export type RelayModernEnvironmentExecuteWithDeferTestNestedUserQuery$variables = {|
  id: string,
|};
export type RelayModernEnvironmentExecuteWithDeferTestNestedUserQuery$data = {|
  +node: ?{|
    +$fragmentSpreads: RelayModernEnvironmentExecuteWithDeferTestNestedUserFragment$fragmentType,
  |},
|};
export type RelayModernEnvironmentExecuteWithDeferTestNestedUserQuery = {|
  response: RelayModernEnvironmentExecuteWithDeferTestNestedUserQuery$data,
  variables: RelayModernEnvironmentExecuteWithDeferTestNestedUserQuery$variables,
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
    "name": "RelayModernEnvironmentExecuteWithDeferTestNestedUserQuery",
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
            "kind": "Defer",
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "RelayModernEnvironmentExecuteWithDeferTestNestedUserFragment"
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
    "name": "RelayModernEnvironmentExecuteWithDeferTestNestedUserQuery",
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
            "if": null,
            "kind": "Defer",
            "label": "RelayModernEnvironmentExecuteWithDeferTestNestedUserQuery$defer$UserFragment",
            "selections": [
              {
                "kind": "InlineFragment",
                "selections": [
                  (v2/*: any*/),
                  {
                    "if": null,
                    "kind": "Defer",
                    "label": "RelayModernEnvironmentExecuteWithDeferTestNestedUserFragment$defer$RelayModernEnvironmentExecuteWithDeferTestNestedInnerUserFragment",
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "name",
                        "storageKey": null
                      },
                      {
                        "if": null,
                        "kind": "Defer",
                        "label": "RelayModernEnvironmentExecuteWithDeferTestNestedInnerUserFragment$defer$RelayModernEnvironmentExecuteWithDeferTestNestedInnerInner2UserFragment",
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "lastName",
                            "storageKey": null
                          }
                        ]
                      }
                    ]
                  }
                ],
                "type": "User",
                "abstractKey": null
              }
            ]
          },
          (v2/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "efa1d471949d3dec258c20b998586f7e",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentExecuteWithDeferTestNestedUserQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentExecuteWithDeferTestNestedUserQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...RelayModernEnvironmentExecuteWithDeferTestNestedUserFragment @defer(label: \"RelayModernEnvironmentExecuteWithDeferTestNestedUserQuery$defer$UserFragment\")\n    id\n  }\n}\n\nfragment RelayModernEnvironmentExecuteWithDeferTestNestedInnerInner2UserFragment on User {\n  lastName\n}\n\nfragment RelayModernEnvironmentExecuteWithDeferTestNestedInnerUserFragment on User {\n  name\n  ...RelayModernEnvironmentExecuteWithDeferTestNestedInnerInner2UserFragment @defer(label: \"RelayModernEnvironmentExecuteWithDeferTestNestedInnerUserFragment$defer$RelayModernEnvironmentExecuteWithDeferTestNestedInnerInner2UserFragment\")\n}\n\nfragment RelayModernEnvironmentExecuteWithDeferTestNestedUserFragment on User {\n  id\n  ...RelayModernEnvironmentExecuteWithDeferTestNestedInnerUserFragment @defer(label: \"RelayModernEnvironmentExecuteWithDeferTestNestedUserFragment$defer$RelayModernEnvironmentExecuteWithDeferTestNestedInnerUserFragment\")\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "d746549fdd29f74e59ee289c7b65d167";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentExecuteWithDeferTestNestedUserQuery$variables,
  RelayModernEnvironmentExecuteWithDeferTestNestedUserQuery$data,
>*/);
