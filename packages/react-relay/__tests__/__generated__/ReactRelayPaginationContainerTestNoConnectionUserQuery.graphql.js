/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<a23de1fccee59aeba39f32aa256ebb0c>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { ReactRelayPaginationContainerTestNoConnectionUserFragment$fragmentType } from "./ReactRelayPaginationContainerTestNoConnectionUserFragment.graphql";
export type ReactRelayPaginationContainerTestNoConnectionUserQuery$variables = {|
  after?: ?string,
  count: number,
  id: string,
  orderby?: ?ReadonlyArray<?string>,
|};
export type ReactRelayPaginationContainerTestNoConnectionUserQuery$data = {|
  +node: ?{|
    +id: string,
    +$fragmentSpreads: ReactRelayPaginationContainerTestNoConnectionUserFragment$fragmentType,
  |},
|};
export type ReactRelayPaginationContainerTestNoConnectionUserQuery = {|
  response: ReactRelayPaginationContainerTestNoConnectionUserQuery$data,
  variables: ReactRelayPaginationContainerTestNoConnectionUserQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "after"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "count"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "orderby"
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
    "name": "ReactRelayPaginationContainerTestNoConnectionUserQuery",
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
            "args": null,
            "kind": "FragmentSpread",
            "name": "ReactRelayPaginationContainerTestNoConnectionUserFragment"
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
    "name": "ReactRelayPaginationContainerTestNoConnectionUserQuery",
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
                "alias": null,
                "args": [
                  {
                    "kind": "Variable",
                    "name": "after",
                    "variableName": "after"
                  },
                  {
                    "kind": "Variable",
                    "name": "first",
                    "variableName": "count"
                  },
                  {
                    "kind": "Variable",
                    "name": "orderby",
                    "variableName": "orderby"
                  }
                ],
                "concreteType": "FriendsConnection",
                "kind": "LinkedField",
                "name": "friends",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "FriendsEdge",
                    "kind": "LinkedField",
                    "name": "edges",
                    "plural": true,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "User",
                        "kind": "LinkedField",
                        "name": "node",
                        "plural": false,
                        "selections": [
                          (v2/*: any*/)
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "PageInfo",
                    "kind": "LinkedField",
                    "name": "pageInfo",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "endCursor",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "hasNextPage",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
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
    "cacheID": "a701ef5f0e258a93c417399f16aad8fa",
    "id": null,
    "metadata": {},
    "name": "ReactRelayPaginationContainerTestNoConnectionUserQuery",
    "operationKind": "query",
    "text": "query ReactRelayPaginationContainerTestNoConnectionUserQuery(\n  $after: ID\n  $count: Int!\n  $id: ID!\n  $orderby: [String]\n) {\n  node(id: $id) {\n    __typename\n    id\n    ...ReactRelayPaginationContainerTestNoConnectionUserFragment\n  }\n}\n\nfragment ReactRelayPaginationContainerTestNoConnectionUserFragment on User {\n  friends(after: $after, first: $count, orderby: $orderby) {\n    edges {\n      node {\n        id\n      }\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "0c78e21bfeadc7de224add3a607c917f";
}

module.exports = ((node/*: any*/)/*: Query<
  ReactRelayPaginationContainerTestNoConnectionUserQuery$variables,
  ReactRelayPaginationContainerTestNoConnectionUserQuery$data,
>*/);
