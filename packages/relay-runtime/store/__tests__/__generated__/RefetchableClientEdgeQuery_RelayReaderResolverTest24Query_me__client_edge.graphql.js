/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<768501c48375b9cd265e1ca1f28a6be0>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment, RefetchableFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RefetchableClientEdgeQuery_RelayReaderResolverTest24Query_me__client_edge$fragmentType: FragmentType;
type ClientEdgeQuery_RelayReaderResolverTest24Query_me__client_edge$variables = any;
export type RefetchableClientEdgeQuery_RelayReaderResolverTest24Query_me__client_edge$data = {|
  +__typename: "User",
  +id: string,
  +$fragmentType: RefetchableClientEdgeQuery_RelayReaderResolverTest24Query_me__client_edge$fragmentType,
|};
export type RefetchableClientEdgeQuery_RelayReaderResolverTest24Query_me__client_edge$key = {
  +$data?: RefetchableClientEdgeQuery_RelayReaderResolverTest24Query_me__client_edge$data,
  +$fragmentSpreads: RefetchableClientEdgeQuery_RelayReaderResolverTest24Query_me__client_edge$fragmentType,
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
      "operation": require('./ClientEdgeQuery_RelayReaderResolverTest24Query_me__client_edge.graphql'),
      "identifierField": "id"
    }
  },
  "name": "RefetchableClientEdgeQuery_RelayReaderResolverTest24Query_me__client_edge",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "__typename",
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
  (node/*: any*/).hash = "8635cde1528b69cd8dd3828aadb768bb";
}

module.exports = ((node/*: any*/)/*: RefetchableFragment<
  RefetchableClientEdgeQuery_RelayReaderResolverTest24Query_me__client_edge$fragmentType,
  RefetchableClientEdgeQuery_RelayReaderResolverTest24Query_me__client_edge$data,
  ClientEdgeQuery_RelayReaderResolverTest24Query_me__client_edge$variables,
>*/);
