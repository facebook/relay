/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<e3c350533e00043b5b652a74f264d718>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment, RefetchableFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RefetchableClientEdgeQuery_LiveResolversTest15Query_live_user_resolver_always_suspend$fragmentType: FragmentType;
type ClientEdgeQuery_LiveResolversTest15Query_live_user_resolver_always_suspend$variables = any;
export type RefetchableClientEdgeQuery_LiveResolversTest15Query_live_user_resolver_always_suspend$data = {|
  +id: string,
  +name: ?string,
  +$fragmentType: RefetchableClientEdgeQuery_LiveResolversTest15Query_live_user_resolver_always_suspend$fragmentType,
|};
export type RefetchableClientEdgeQuery_LiveResolversTest15Query_live_user_resolver_always_suspend$key = {
  +$data?: RefetchableClientEdgeQuery_LiveResolversTest15Query_live_user_resolver_always_suspend$data,
  +$fragmentSpreads: RefetchableClientEdgeQuery_LiveResolversTest15Query_live_user_resolver_always_suspend$fragmentType,
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
      "operation": require('./ClientEdgeQuery_LiveResolversTest15Query_live_user_resolver_always_suspend.graphql'),
      "identifierField": "id"
    }
  },
  "name": "RefetchableClientEdgeQuery_LiveResolversTest15Query_live_user_resolver_always_suspend",
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
      "name": "id",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "649fcb31c6138f80ad0ebb97c80d9ae6";
}

module.exports = ((node/*: any*/)/*: RefetchableFragment<
  RefetchableClientEdgeQuery_LiveResolversTest15Query_live_user_resolver_always_suspend$fragmentType,
  RefetchableClientEdgeQuery_LiveResolversTest15Query_live_user_resolver_always_suspend$data,
  ClientEdgeQuery_LiveResolversTest15Query_live_user_resolver_always_suspend$variables,
>*/);
