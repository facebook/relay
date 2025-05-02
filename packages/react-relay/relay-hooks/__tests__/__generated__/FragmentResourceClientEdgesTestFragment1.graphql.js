/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<7028fe2aede7e97bfd47e8cc72cc68db>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { UserClientEdgeResolver$key } from "./../../../../relay-runtime/store/__tests__/resolvers/__generated__/UserClientEdgeResolver.graphql";
import type { FragmentType, DataID } from "relay-runtime";
import {client_edge as userClientEdgeResolverType} from "../../../../relay-runtime/store/__tests__/resolvers/UserClientEdgeResolver.js";
import type { TestResolverContextType } from "../../../../relay-runtime/mutations/__tests__/TestResolverContextType";
// Type assertion validating that `userClientEdgeResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(userClientEdgeResolverType: (
  rootKey: UserClientEdgeResolver$key,
  args: void,
  context: TestResolverContextType,
) => ?{|
  +id: DataID,
|});
declare export opaque type FragmentResourceClientEdgesTestFragment1$fragmentType: FragmentType;
export type FragmentResourceClientEdgesTestFragment1$data = {|
  +client_edge: ?{|
    +name: ?string,
  |},
  +$fragmentType: FragmentResourceClientEdgesTestFragment1$fragmentType,
|};
export type FragmentResourceClientEdgesTestFragment1$key = {
  +$data?: FragmentResourceClientEdgesTestFragment1$data,
  +$fragmentSpreads: FragmentResourceClientEdgesTestFragment1$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "hasClientEdges": true
  },
  "name": "FragmentResourceClientEdgesTestFragment1",
  "selections": [
    {
      "kind": "ClientEdgeToServerObject",
      "operation": require('./ClientEdgeQuery_FragmentResourceClientEdgesTestFragment1_client_edge.graphql'),
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
        "resolverModule": require('../../../../relay-runtime/store/__tests__/resolvers/UserClientEdgeResolver').client_edge,
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
  (node/*: any*/).hash = "1f48d41b9528e868e1c370d6b664599b";
}

module.exports = ((node/*: any*/)/*: Fragment<
  FragmentResourceClientEdgesTestFragment1$fragmentType,
  FragmentResourceClientEdgesTestFragment1$data,
>*/);
