/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<aa881c5f23b9795c67f4ebdf2884b03c>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment, RefetchableFragment } from 'relay-runtime';
import type { ClientEdgesTestUpperName$key } from "./ClientEdgesTestUpperName.graphql";
import type { FragmentType } from "relay-runtime";
import {upper_name as userUpperNameResolverType} from "../ClientEdges-test.js";
import type { TestResolverContextType } from "../../../relay-runtime/mutations/__tests__/TestResolverContextType";
// Type assertion validating that `userUpperNameResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(userUpperNameResolverType as (
  rootKey: ClientEdgesTestUpperName$key,
  args: void,
  context: TestResolverContextType,
) => ?string);
declare export opaque type RefetchableClientEdgeQuery_ClientEdgesTest6Query_me__same_user_client_edge$fragmentType: FragmentType;
type ClientEdgeQuery_ClientEdgesTest6Query_me__same_user_client_edge$variables = any;
export type RefetchableClientEdgeQuery_ClientEdgesTest6Query_me__same_user_client_edge$data = {|
  +id: string,
  +upper_name: ?string,
  +$fragmentType: RefetchableClientEdgeQuery_ClientEdgesTest6Query_me__same_user_client_edge$fragmentType,
|};
export type RefetchableClientEdgeQuery_ClientEdgesTest6Query_me__same_user_client_edge$key = {
  +$data?: RefetchableClientEdgeQuery_ClientEdgesTest6Query_me__same_user_client_edge$data,
  +$fragmentSpreads: RefetchableClientEdgeQuery_ClientEdgesTest6Query_me__same_user_client_edge$fragmentType,
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
      "operation": require('./ClientEdgeQuery_ClientEdgesTest6Query_me__same_user_client_edge.graphql'),
      "identifierInfo": {
        "identifierField": "id",
        "identifierQueryVariableName": "id"
      }
    }
  },
  "name": "RefetchableClientEdgeQuery_ClientEdgesTest6Query_me__same_user_client_edge",
  "selections": [
    {
      "alias": null,
      "args": null,
      "fragment": {
        "args": null,
        "kind": "FragmentSpread",
        "name": "ClientEdgesTestUpperName"
      },
      "kind": "RelayResolver",
      "name": "upper_name",
      "resolverModule": require('../ClientEdges-test').upper_name,
      "path": "upper_name"
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
  (node/*:: as any*/).hash = "330a0878ce30575d8c36e2fdd626c833";
}

module.exports = ((node/*:: as any*/)/*:: as RefetchableFragment<
  RefetchableClientEdgeQuery_ClientEdgesTest6Query_me__same_user_client_edge$fragmentType,
  RefetchableClientEdgeQuery_ClientEdgesTest6Query_me__same_user_client_edge$data,
  ClientEdgeQuery_ClientEdgesTest6Query_me__same_user_client_edge$variables,
>*/);
