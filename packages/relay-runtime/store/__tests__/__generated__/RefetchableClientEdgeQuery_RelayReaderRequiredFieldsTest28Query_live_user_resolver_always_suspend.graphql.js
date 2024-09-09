/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<d3b88dc21a623e8ddd915bf7a208bbfa>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment, RefetchableFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RefetchableClientEdgeQuery_RelayReaderRequiredFieldsTest28Query_live_user_resolver_always_suspend$fragmentType: FragmentType;
type ClientEdgeQuery_RelayReaderRequiredFieldsTest28Query_live_user_resolver_always_suspend$variables = any;
export type RefetchableClientEdgeQuery_RelayReaderRequiredFieldsTest28Query_live_user_resolver_always_suspend$data = {|
  +id: string,
  +name: ?string,
  +$fragmentType: RefetchableClientEdgeQuery_RelayReaderRequiredFieldsTest28Query_live_user_resolver_always_suspend$fragmentType,
|};
export type RefetchableClientEdgeQuery_RelayReaderRequiredFieldsTest28Query_live_user_resolver_always_suspend$key = {
  +$data?: RefetchableClientEdgeQuery_RelayReaderRequiredFieldsTest28Query_live_user_resolver_always_suspend$data,
  +$fragmentSpreads: RefetchableClientEdgeQuery_RelayReaderRequiredFieldsTest28Query_live_user_resolver_always_suspend$fragmentType,
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
      "operation": require('./ClientEdgeQuery_RelayReaderRequiredFieldsTest28Query_live_user_resolver_always_suspend.graphql'),
      "identifierInfo": {
        "identifierField": "id",
        "identifierQueryVariableName": "id"
      }
    }
  },
  "name": "RefetchableClientEdgeQuery_RelayReaderRequiredFieldsTest28Query_live_user_resolver_always_suspend",
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
  (node/*: any*/).hash = "1ea17c6315e8ba285db304130201310d";
}

module.exports = ((node/*: any*/)/*: RefetchableFragment<
  RefetchableClientEdgeQuery_RelayReaderRequiredFieldsTest28Query_live_user_resolver_always_suspend$fragmentType,
  RefetchableClientEdgeQuery_RelayReaderRequiredFieldsTest28Query_live_user_resolver_always_suspend$data,
  ClientEdgeQuery_RelayReaderRequiredFieldsTest28Query_live_user_resolver_always_suspend$variables,
>*/);
