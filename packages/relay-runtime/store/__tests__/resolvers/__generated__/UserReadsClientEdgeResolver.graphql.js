/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<86cdc5e5257c9ebf2d6e0d08c6c8daf6>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { UserClientEdgeResolver$key } from "./UserClientEdgeResolver.graphql";
import type { FragmentType, DataID } from "relay-runtime";
import {client_edge as userClientEdgeResolverType} from "../UserClientEdgeResolver.js";
import type { TestResolverContextType } from "../../../../mutations/__tests__/TestResolverContextType";
// Type assertion validating that `userClientEdgeResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(userClientEdgeResolverType: (
  rootKey: UserClientEdgeResolver$key,
  args: void,
  context: TestResolverContextType,
) => ?{|
  +id: DataID,
|});
declare export opaque type UserReadsClientEdgeResolver$fragmentType: FragmentType;
export type UserReadsClientEdgeResolver$data = {|
  +client_edge: ?{|
    +name: ?string,
  |},
  +$fragmentType: UserReadsClientEdgeResolver$fragmentType,
|};
export type UserReadsClientEdgeResolver$key = {
  +$data?: UserReadsClientEdgeResolver$data,
  +$fragmentSpreads: UserReadsClientEdgeResolver$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "hasClientEdges": true
  },
  "name": "UserReadsClientEdgeResolver",
  "selections": [
    {
      "kind": "ClientEdgeToServerObject",
      "operation": require('./ClientEdgeQuery_UserReadsClientEdgeResolver_client_edge.graphql'),
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
        "resolverModule": require('../UserClientEdgeResolver').client_edge,
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
  (node/*: any*/).hash = "e516986653910442a460b9755999c3e5";
}

module.exports = ((node/*: any*/)/*: Fragment<
  UserReadsClientEdgeResolver$fragmentType,
  UserReadsClientEdgeResolver$data,
>*/);
