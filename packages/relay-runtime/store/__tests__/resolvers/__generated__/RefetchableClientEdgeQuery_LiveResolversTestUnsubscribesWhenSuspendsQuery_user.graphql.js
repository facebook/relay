/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<02f06f3b82d93c55847bce5d5f4da3ba>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment, RefetchableFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RefetchableClientEdgeQuery_LiveResolversTestUnsubscribesWhenSuspendsQuery_user$fragmentType: FragmentType;
type ClientEdgeQuery_LiveResolversTestUnsubscribesWhenSuspendsQuery_user$variables = any;
export type RefetchableClientEdgeQuery_LiveResolversTestUnsubscribesWhenSuspendsQuery_user$data = {|
  +id: string,
  +$fragmentType: RefetchableClientEdgeQuery_LiveResolversTestUnsubscribesWhenSuspendsQuery_user$fragmentType,
|};
export type RefetchableClientEdgeQuery_LiveResolversTestUnsubscribesWhenSuspendsQuery_user$key = {
  +$data?: RefetchableClientEdgeQuery_LiveResolversTestUnsubscribesWhenSuspendsQuery_user$data,
  +$fragmentSpreads: RefetchableClientEdgeQuery_LiveResolversTestUnsubscribesWhenSuspendsQuery_user$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "refetch": {
      "connection": null,
      "fragmentPathInResult": [
        "node"
      ],
      "operation": require('./ClientEdgeQuery_LiveResolversTestUnsubscribesWhenSuspendsQuery_user.graphql'),
      "identifierField": "id"
    }
  },
  "name": "RefetchableClientEdgeQuery_LiveResolversTestUnsubscribesWhenSuspendsQuery_user",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "06f9d01a4042d27c7e069bc35d4694c1";
}

module.exports = ((node/*: any*/)/*: RefetchableFragment<
  RefetchableClientEdgeQuery_LiveResolversTestUnsubscribesWhenSuspendsQuery_user$fragmentType,
  RefetchableClientEdgeQuery_LiveResolversTestUnsubscribesWhenSuspendsQuery_user$data,
  ClientEdgeQuery_LiveResolversTestUnsubscribesWhenSuspendsQuery_user$variables,
>*/);
