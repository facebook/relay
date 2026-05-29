/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<5c5d4a46a1c8e2b40ebb891c172a41b2>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment, RefetchableFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RefetchableClientEdgeQuery_RelayReaderClientEdgesTest6Query_me__the_alias$fragmentType: FragmentType;
type ClientEdgeQuery_RelayReaderClientEdgesTest6Query_me__the_alias$variables = any;
export type RefetchableClientEdgeQuery_RelayReaderClientEdgesTest6Query_me__the_alias$data = {
  readonly id: string,
  readonly name: ?string,
  readonly $fragmentType: RefetchableClientEdgeQuery_RelayReaderClientEdgesTest6Query_me__the_alias$fragmentType,
};
export type RefetchableClientEdgeQuery_RelayReaderClientEdgesTest6Query_me__the_alias$key = {
  readonly $data?: RefetchableClientEdgeQuery_RelayReaderClientEdgesTest6Query_me__the_alias$data,
  readonly $fragmentSpreads: RefetchableClientEdgeQuery_RelayReaderClientEdgesTest6Query_me__the_alias$fragmentType,
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
      "operation": require('./ClientEdgeQuery_RelayReaderClientEdgesTest6Query_me__the_alias.graphql'),
      "identifierInfo": {
        "identifierField": "id",
        "identifierQueryVariableName": "id"
      }
    }
  },
  "name": "RefetchableClientEdgeQuery_RelayReaderClientEdgesTest6Query_me__the_alias",
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
  (node/*:: as any*/).hash = "9b8dd5eefbc4ad7a0eb7a42257b6abb5";
}

module.exports = ((node/*:: as any*/)/*:: as RefetchableFragment<
  RefetchableClientEdgeQuery_RelayReaderClientEdgesTest6Query_me__the_alias$fragmentType,
  RefetchableClientEdgeQuery_RelayReaderClientEdgesTest6Query_me__the_alias$data,
  ClientEdgeQuery_RelayReaderClientEdgesTest6Query_me__the_alias$variables,
>*/);
