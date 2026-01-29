/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<47f818db2f3c03fb471e6c9dee98d892>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { UserClientEdgeResolver$key } from "./../resolvers/__generated__/UserClientEdgeResolver.graphql";
import type { FragmentType, DataID } from "relay-runtime";
import {client_edge as userClientEdgeResolverType} from "../resolvers/UserClientEdgeResolver.js";
import type { TestResolverContextType } from "../../../mutations/__tests__/TestResolverContextType";
// Type assertion validating that `userClientEdgeResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(userClientEdgeResolverType: (
  rootKey: UserClientEdgeResolver$key,
  args: void,
  context: TestResolverContextType,
) => ?{|
  +id: DataID,
|});
declare export opaque type observeFragmentTestClientEdgeToServerFragment$fragmentType: FragmentType;
export type observeFragmentTestClientEdgeToServerFragment$data = {|
  +client_edge: ?{|
    +name: ?string,
  |},
  +$fragmentType: observeFragmentTestClientEdgeToServerFragment$fragmentType,
|};
export type observeFragmentTestClientEdgeToServerFragment$key = {
  +$data?: observeFragmentTestClientEdgeToServerFragment$data,
  +$fragmentSpreads: observeFragmentTestClientEdgeToServerFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "hasClientEdges": true
  },
  "name": "observeFragmentTestClientEdgeToServerFragment",
  "selections": [
    {
      "kind": "ClientEdgeToServerObject",
      "operation": require('./ClientEdgeQuery_observeFragmentTestClientEdgeToServerFragment_client_edge.graphql'),
      "backingField": {
        "alias": null,
        "args": null,
        "fragment": {
          "args": null,
          "kind": "FragmentSpread",
          "name": "UserClientEdgeResolver"
        },
        "kind": "RelayResolver",
        "name": "client_edge",
        "resolverModule": require('../resolvers/UserClientEdgeResolver').client_edge,
        "path": "client_edge"
      },
      "linkedField": {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "client_edge",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "name",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "145cd045d842ac7fe259d9f5210a67c1";
}

module.exports = ((node/*: any*/)/*: Fragment<
  observeFragmentTestClientEdgeToServerFragment$fragmentType,
  observeFragmentTestClientEdgeToServerFragment$data,
>*/);
