/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<cc64afff3a1fe856aefaa929dca4add7>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment, RefetchableFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RefetchableClientEdgeQuery_FragmentResourceClientEdgesTestFragment1_client_edge$fragmentType: FragmentType;
type ClientEdgeQuery_FragmentResourceClientEdgesTestFragment1_client_edge$variables = any;
export type RefetchableClientEdgeQuery_FragmentResourceClientEdgesTestFragment1_client_edge$data = {|
  +id: string,
  +name: ?string,
  +$fragmentType: RefetchableClientEdgeQuery_FragmentResourceClientEdgesTestFragment1_client_edge$fragmentType,
|};
export type RefetchableClientEdgeQuery_FragmentResourceClientEdgesTestFragment1_client_edge$key = {
  +$data?: RefetchableClientEdgeQuery_FragmentResourceClientEdgesTestFragment1_client_edge$data,
  +$fragmentSpreads: RefetchableClientEdgeQuery_FragmentResourceClientEdgesTestFragment1_client_edge$fragmentType,
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
      "operation": require('./ClientEdgeQuery_FragmentResourceClientEdgesTestFragment1_client_edge.graphql'),
      "identifierField": "id"
    }
  },
  "name": "RefetchableClientEdgeQuery_FragmentResourceClientEdgesTestFragment1_client_edge",
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
  (node/*: any*/).hash = "1f48d41b9528e868e1c370d6b664599b";
}

module.exports = ((node/*: any*/)/*: RefetchableFragment<
  RefetchableClientEdgeQuery_FragmentResourceClientEdgesTestFragment1_client_edge$fragmentType,
  RefetchableClientEdgeQuery_FragmentResourceClientEdgesTestFragment1_client_edge$data,
  ClientEdgeQuery_FragmentResourceClientEdgesTestFragment1_client_edge$variables,
>*/);
