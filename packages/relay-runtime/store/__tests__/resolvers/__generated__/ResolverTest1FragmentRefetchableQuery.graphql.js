/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<8a86f79dfa13ce5ed3c3c7cd1b551788>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
import type { ResolverTest2Fragment$fragmentType } from "./ResolverTest2Fragment.graphql";
export type ResolverTest1FragmentRefetchableQuery$variables = {|
  id: string,
|};
export type ResolverTest1FragmentRefetchableQuery$data = {|
  +node: ?{|
    +$fragmentSpreads: ResolverTest2Fragment$fragmentType,
  |},
|};
export type ResolverTest1FragmentRefetchableQuery = {|
  response: ResolverTest1FragmentRefetchableQuery$data,
  variables: ResolverTest1FragmentRefetchableQuery$variables,
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
    "name": "ResolverTest1FragmentRefetchableQuery",
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
            "name": "ResolverTest2Fragment"
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
    "name": "ResolverTest1FragmentRefetchableQuery",
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
                "name": "greeting",
                "args": null,
                "fragment": {
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
                },
                "kind": "RelayResolver",
                "storageKey": null,
                "isOutputType": true
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
    "cacheID": "0b557eb9529a9c3ed7d525932fc431f9",
    "id": null,
    "metadata": {},
    "name": "ResolverTest1FragmentRefetchableQuery",
    "operationKind": "query",
    "text": "query ResolverTest1FragmentRefetchableQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...ResolverTest2Fragment\n    id\n  }\n}\n\nfragment ResolverTest2Fragment on User {\n  ...UserGreetingResolver\n  id\n}\n\nfragment UserGreetingResolver on User {\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "9064332782abe615b663971d3f85a3ea";
}

module.exports = ((node/*: any*/)/*: Query<
  ResolverTest1FragmentRefetchableQuery$variables,
  ResolverTest1FragmentRefetchableQuery$data,
>*/);
