/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<3abf00f6e0a490dd09290902aba1bec9>>
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
export type ReactRelayPaginationContainerTestNoConnectionOnFragmentViewerFragment$ref = ReactRelayPaginationContainerTestNoConnectionOnFragmentViewerFragment$fragmentType;
export type ReactRelayPaginationContainerTestNoConnectionOnFragmentViewerFragment$data = {|
  +actor: ?{|
    +id: string,
  |},
  +$refType: ReactRelayPaginationContainerTestNoConnectionOnFragmentViewerFragment$fragmentType,
  +$fragmentType: ReactRelayPaginationContainerTestNoConnectionOnFragmentViewerFragment$fragmentType,
|};
export type ReactRelayPaginationContainerTestNoConnectionOnFragmentViewerFragment = ReactRelayPaginationContainerTestNoConnectionOnFragmentViewerFragment$data;
export type ReactRelayPaginationContainerTestNoConnectionOnFragmentViewerFragment$key = {
  +$data?: ReactRelayPaginationContainerTestNoConnectionOnFragmentViewerFragment$data,
  +$fragmentRefs: ReactRelayPaginationContainerTestNoConnectionOnFragmentViewerFragment$fragmentType,
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
