/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<38119d2859c697aa13c27778fa54d347>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment, RefetchableFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RefetchableClientEdgeQuery_ClientOnlyQueriesTest3Query_hello_user$fragmentType: FragmentType;
type ClientEdgeQuery_ClientOnlyQueriesTest3Query_hello_user$variables = any;
export type RefetchableClientEdgeQuery_ClientOnlyQueriesTest3Query_hello_user$data = {|
  +id: string,
  +name: ?string,
  +$fragmentType: RefetchableClientEdgeQuery_ClientOnlyQueriesTest3Query_hello_user$fragmentType,
|};
export type RefetchableClientEdgeQuery_ClientOnlyQueriesTest3Query_hello_user$key = {
  +$data?: RefetchableClientEdgeQuery_ClientOnlyQueriesTest3Query_hello_user$data,
  +$fragmentSpreads: RefetchableClientEdgeQuery_ClientOnlyQueriesTest3Query_hello_user$fragmentType,
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
      "operation": require('./ClientEdgeQuery_ClientOnlyQueriesTest3Query_hello_user.graphql'),
      "identifierInfo": {
        "identifierField": "id",
        "identifierQueryVariableName": "id"
      }
    }
  },
  "name": "RefetchableClientEdgeQuery_ClientOnlyQueriesTest3Query_hello_user",
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
  (node/*: any*/).hash = "f39e561157fa607bf64e77aad228aa05";
}

module.exports = ((node/*: any*/)/*: RefetchableFragment<
  RefetchableClientEdgeQuery_ClientOnlyQueriesTest3Query_hello_user$fragmentType,
  RefetchableClientEdgeQuery_ClientOnlyQueriesTest3Query_hello_user$data,
  ClientEdgeQuery_ClientOnlyQueriesTest3Query_hello_user$variables,
>*/);
