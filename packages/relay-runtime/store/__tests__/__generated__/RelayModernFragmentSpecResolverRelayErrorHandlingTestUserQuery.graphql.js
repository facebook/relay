/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<a1848d8edbdd180ce58e1791ff159736>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayModernFragmentSpecResolverRelayErrorHandlingTestUserFragment$fragmentType } from "./RelayModernFragmentSpecResolverRelayErrorHandlingTestUserFragment.graphql";
export type RelayModernFragmentSpecResolverRelayErrorHandlingTestUserQuery$variables = {|
  id: string,
|};
export type RelayModernFragmentSpecResolverRelayErrorHandlingTestUserQuery$data = {|
  +node: ?{|
    +$fragmentSpreads: RelayModernFragmentSpecResolverRelayErrorHandlingTestUserFragment$fragmentType,
  |},
|};
export type RelayModernFragmentSpecResolverRelayErrorHandlingTestUserQuery = {|
  response: RelayModernFragmentSpecResolverRelayErrorHandlingTestUserQuery$data,
  variables: RelayModernFragmentSpecResolverRelayErrorHandlingTestUserQuery$variables,
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
    "name": "RelayModernFragmentSpecResolverRelayErrorHandlingTestUserQuery",
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
            "name": "RelayModernFragmentSpecResolverRelayErrorHandlingTestUserFragment"
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
    "name": "RelayModernFragmentSpecResolverRelayErrorHandlingTestUserQuery",
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
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "alternate_name",
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
    "cacheID": "c4cf80a23e44ff3f595c75842d5282e7",
    "id": null,
    "metadata": {},
    "name": "RelayModernFragmentSpecResolverRelayErrorHandlingTestUserQuery",
    "operationKind": "query",
    "text": "query RelayModernFragmentSpecResolverRelayErrorHandlingTestUserQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...RelayModernFragmentSpecResolverRelayErrorHandlingTestUserFragment\n    id\n  }\n}\n\nfragment RelayModernFragmentSpecResolverRelayErrorHandlingTestUserFragment on User {\n  id\n  name\n  alternate_name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "60199bb18ad2d2e05c0a529f7be6f6b2";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernFragmentSpecResolverRelayErrorHandlingTestUserQuery$variables,
  RelayModernFragmentSpecResolverRelayErrorHandlingTestUserQuery$data,
>*/);
