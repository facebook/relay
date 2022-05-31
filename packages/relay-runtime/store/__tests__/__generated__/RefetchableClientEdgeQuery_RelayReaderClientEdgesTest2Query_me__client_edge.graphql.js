/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<eda1a70a6fd6150345924e877596e84d>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment, RefetchableFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RefetchableClientEdgeQuery_RelayReaderClientEdgesTest2Query_me__client_edge$fragmentType: FragmentType;
type ClientEdgeQuery_RelayReaderClientEdgesTest2Query_me__client_edge$variables = any;
export type RefetchableClientEdgeQuery_RelayReaderClientEdgesTest2Query_me__client_edge$data = {|
  +author: ?{|
    +name: ?string,
  |},
  +id: string,
  +$fragmentType: RefetchableClientEdgeQuery_RelayReaderClientEdgesTest2Query_me__client_edge$fragmentType,
|};
export type RefetchableClientEdgeQuery_RelayReaderClientEdgesTest2Query_me__client_edge$key = {
  +$data?: RefetchableClientEdgeQuery_RelayReaderClientEdgesTest2Query_me__client_edge$data,
  +$fragmentSpreads: RefetchableClientEdgeQuery_RelayReaderClientEdgesTest2Query_me__client_edge$fragmentType,
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
      "operation": require('./ClientEdgeQuery_RelayReaderClientEdgesTest2Query_me__client_edge.graphql'),
      "identifierField": "id"
    }
  },
  "name": "RefetchableClientEdgeQuery_RelayReaderClientEdgesTest2Query_me__client_edge",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "User",
      "kind": "LinkedField",
      "name": "author",
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
  (node/*: any*/).hash = "689b6ff4676cde8ba8788bb10c7962fc";
}

module.exports = ((node/*: any*/)/*: RefetchableFragment<
  RefetchableClientEdgeQuery_RelayReaderClientEdgesTest2Query_me__client_edge$fragmentType,
  RefetchableClientEdgeQuery_RelayReaderClientEdgesTest2Query_me__client_edge$data,
  ClientEdgeQuery_RelayReaderClientEdgesTest2Query_me__client_edge$variables,
>*/);
