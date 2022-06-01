/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<bf35a38fc9e4df650c3c249f9897b4c9>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
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
        "resolverModule": require('./../UserClientEdgeResolver.js'),
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
