/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<9a375d2a5621a15ba4c2a1f71de1afc2>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment, RefetchableFragment } from 'relay-runtime';
import type { ClientEdgesTest5Query_user$fragmentType } from "./ClientEdgesTest5Query_user.graphql";
import type { FragmentType } from "relay-runtime";
declare export opaque type RefetchableClientEdgeQuery_ClientEdgesTest5Query_me__same_user_client_edge$fragmentType: FragmentType;
type ClientEdgeQuery_ClientEdgesTest5Query_me__same_user_client_edge$variables = any;
export type RefetchableClientEdgeQuery_ClientEdgesTest5Query_me__same_user_client_edge$data = {|
  +id: string,
  +$fragmentSpreads: ClientEdgesTest5Query_user$fragmentType,
  +$fragmentType: RefetchableClientEdgeQuery_ClientEdgesTest5Query_me__same_user_client_edge$fragmentType,
|};
export type RefetchableClientEdgeQuery_ClientEdgesTest5Query_me__same_user_client_edge$key = {
  +$data?: RefetchableClientEdgeQuery_ClientEdgesTest5Query_me__same_user_client_edge$data,
  +$fragmentSpreads: RefetchableClientEdgeQuery_ClientEdgesTest5Query_me__same_user_client_edge$fragmentType,
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
      "operation": require('./ClientEdgeQuery_ClientEdgesTest5Query_me__same_user_client_edge.graphql'),
      "identifierInfo": {
        "identifierField": "id",
        "identifierQueryVariableName": "id"
      }
    }
  },
  "name": "RefetchableClientEdgeQuery_ClientEdgesTest5Query_me__same_user_client_edge",
  "selections": [
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "ClientEdgesTest5Query_user"
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
  (node/*: any*/).hash = "8274337dee7283631e4c2d3992c0add6";
}

module.exports = ((node/*: any*/)/*: RefetchableFragment<
  RefetchableClientEdgeQuery_ClientEdgesTest5Query_me__same_user_client_edge$fragmentType,
  RefetchableClientEdgeQuery_ClientEdgesTest5Query_me__same_user_client_edge$data,
  ClientEdgeQuery_ClientEdgesTest5Query_me__same_user_client_edge$variables,
>*/);
