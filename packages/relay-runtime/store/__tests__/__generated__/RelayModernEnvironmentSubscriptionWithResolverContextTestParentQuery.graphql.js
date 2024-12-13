/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<ae33f4ea5c0717fc08b0a1597597cb9f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayModernEnvironmentSubscriptionWithResolverContextTestUserFragment$fragmentType } from "./RelayModernEnvironmentSubscriptionWithResolverContextTestUserFragment.graphql";
export type RelayModernEnvironmentSubscriptionWithResolverContextTestParentQuery$variables = {||};
export type RelayModernEnvironmentSubscriptionWithResolverContextTestParentQuery$data = {|
  +me: ?{|
    +$fragmentSpreads: RelayModernEnvironmentSubscriptionWithResolverContextTestUserFragment$fragmentType,
  |},
|};
export type RelayModernEnvironmentSubscriptionWithResolverContextTestParentQuery = {|
  response: RelayModernEnvironmentSubscriptionWithResolverContextTestParentQuery$data,
  variables: RelayModernEnvironmentSubscriptionWithResolverContextTestParentQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentSubscriptionWithResolverContextTestParentQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "RelayModernEnvironmentSubscriptionWithResolverContextTestUserFragment"
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
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayModernEnvironmentSubscriptionWithResolverContextTestParentQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "name",
            "storageKey": null
          },
          {
            "kind": "ClientExtension",
            "selections": [
              {
                "name": "age",
                "args": null,
                "fragment": null,
                "kind": "RelayResolver",
                "storageKey": null,
                "isOutputType": true
              }
            ]
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "c498bb05241f280bc2224c29335322d9",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentSubscriptionWithResolverContextTestParentQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentSubscriptionWithResolverContextTestParentQuery {\n  me {\n    ...RelayModernEnvironmentSubscriptionWithResolverContextTestUserFragment\n    id\n  }\n}\n\nfragment RelayModernEnvironmentSubscriptionWithResolverContextTestUserFragment on User {\n  id\n  name\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "51bb39abe5fa87455d7805c59b5def94";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentSubscriptionWithResolverContextTestParentQuery$variables,
  RelayModernEnvironmentSubscriptionWithResolverContextTestParentQuery$data,
>*/);
