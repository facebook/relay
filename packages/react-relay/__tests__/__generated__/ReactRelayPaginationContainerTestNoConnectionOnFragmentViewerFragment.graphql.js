/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<0e2ba15ad1e7d1d08a1f15a9f1197c17>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type ReactRelayPaginationContainerTestNoConnectionOnFragmentViewerFragment$fragmentType: FragmentType;
export type ReactRelayPaginationContainerTestNoConnectionOnFragmentViewerFragment$data = {|
  +actor: ?{|
    +id: string,
  |},
  +$fragmentType: ReactRelayPaginationContainerTestNoConnectionOnFragmentViewerFragment$fragmentType,
|};
export type ReactRelayPaginationContainerTestNoConnectionOnFragmentViewerFragment$key = {
  +$data?: ReactRelayPaginationContainerTestNoConnectionOnFragmentViewerFragment$data,
  +$fragmentSpreads: ReactRelayPaginationContainerTestNoConnectionOnFragmentViewerFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ReactRelayPaginationContainerTestNoConnectionOnFragmentViewerFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "actor",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "id",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Viewer",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "57042a4c48161b75f6f8095dd0707876";
}

module.exports = ((node/*: any*/)/*: Fragment<
  ReactRelayPaginationContainerTestNoConnectionOnFragmentViewerFragment$fragmentType,
  ReactRelayPaginationContainerTestNoConnectionOnFragmentViewerFragment$data,
>*/);
