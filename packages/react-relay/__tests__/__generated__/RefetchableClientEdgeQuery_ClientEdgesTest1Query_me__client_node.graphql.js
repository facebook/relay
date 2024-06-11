/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<ba42a39fb693d5037d97aa3b648c2d9a>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment, RefetchableFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RefetchableClientEdgeQuery_ClientEdgesTest1Query_me__client_node$fragmentType: FragmentType;
type ClientEdgeQuery_ClientEdgesTest1Query_me__client_node$variables = any;
export type RefetchableClientEdgeQuery_ClientEdgesTest1Query_me__client_node$data = {|
  +id: string,
  +name?: ?string,
  +$fragmentType: RefetchableClientEdgeQuery_ClientEdgesTest1Query_me__client_node$fragmentType,
|};
export type RefetchableClientEdgeQuery_ClientEdgesTest1Query_me__client_node$key = {
  +$data?: RefetchableClientEdgeQuery_ClientEdgesTest1Query_me__client_node$data,
  +$fragmentSpreads: RefetchableClientEdgeQuery_ClientEdgesTest1Query_me__client_node$fragmentType,
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
      "operation": require('./ClientEdgeQuery_ClientEdgesTest1Query_me__client_node.graphql'),
      "identifierInfo": {
        "identifierField": "id",
        "identifierQueryVariableName": "id"
      }
    }
  },
  "name": "RefetchableClientEdgeQuery_ClientEdgesTest1Query_me__client_node",
  "selections": [
    {
      "kind": "InlineFragment",
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "name",
          "storageKey": null
        }
      ],
      "type": "User",
      "abstractKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    }
  ],
  "type": "Node",
  "abstractKey": "__isNode"
};

if (__DEV__) {
  (node/*: any*/).hash = "69d7fa3908eedb4d634799d1252e80a7";
}

module.exports = ((node/*: any*/)/*: RefetchableFragment<
  RefetchableClientEdgeQuery_ClientEdgesTest1Query_me__client_node$fragmentType,
  RefetchableClientEdgeQuery_ClientEdgesTest1Query_me__client_node$data,
  ClientEdgeQuery_ClientEdgesTest1Query_me__client_node$variables,
>*/);
