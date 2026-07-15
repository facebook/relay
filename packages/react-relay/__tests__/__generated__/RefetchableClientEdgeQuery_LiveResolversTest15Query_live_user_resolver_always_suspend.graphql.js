/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<2b7b7abdb1b9d8646288442b870bc3d7>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment, RefetchableFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RefetchableClientEdgeQuery_LiveResolversTest15Query_live_user_resolver_always_suspend$fragmentType: FragmentType;
type ClientEdgeQuery_LiveResolversTest15Query_live_user_resolver_always_suspend$variables = any;
export type RefetchableClientEdgeQuery_LiveResolversTest15Query_live_user_resolver_always_suspend$data = {
  readonly id: string,
  readonly name: ?string,
  readonly $fragmentType: RefetchableClientEdgeQuery_LiveResolversTest15Query_live_user_resolver_always_suspend$fragmentType,
};
export type RefetchableClientEdgeQuery_LiveResolversTest15Query_live_user_resolver_always_suspend$key = {
  readonly $data?: RefetchableClientEdgeQuery_LiveResolversTest15Query_live_user_resolver_always_suspend$data,
  readonly $fragmentSpreads: RefetchableClientEdgeQuery_LiveResolversTest15Query_live_user_resolver_always_suspend$fragmentType,
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
      "identifierInfo": {
        "identifierField": "id",
        "identifierQueryVariableName": "id"
      }
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
  (node/*:: as any*/).hash = "649fcb31c6138f80ad0ebb97c80d9ae6";
}

module.exports = ((node/*:: as any*/)/*:: as RefetchableFragment<
  RefetchableClientEdgeQuery_LiveResolversTest15Query_live_user_resolver_always_suspend$fragmentType,
  RefetchableClientEdgeQuery_LiveResolversTest15Query_live_user_resolver_always_suspend$data,
  ClientEdgeQuery_LiveResolversTest15Query_live_user_resolver_always_suspend$variables,
>*/);
