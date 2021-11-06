/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<3badb2b51fd7274d15e2346ec263bab4>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type ReactRelayPaginationContainerTestNoConnectionOnFragmentViewerFragment$ref: FragmentReference;
declare export opaque type ReactRelayPaginationContainerTestNoConnectionOnFragmentViewerFragment$fragmentType: ReactRelayPaginationContainerTestNoConnectionOnFragmentViewerFragment$ref;
export type ReactRelayPaginationContainerTestNoConnectionOnFragmentViewerFragment = {|
  +actor: ?{|
    +id: string,
  |},
  +$refType: ReactRelayPaginationContainerTestNoConnectionOnFragmentViewerFragment$ref,
|};
export type ReactRelayPaginationContainerTestNoConnectionOnFragmentViewerFragment$data = ReactRelayPaginationContainerTestNoConnectionOnFragmentViewerFragment;
export type ReactRelayPaginationContainerTestNoConnectionOnFragmentViewerFragment$key = {
  +$data?: ReactRelayPaginationContainerTestNoConnectionOnFragmentViewerFragment$data,
  +$fragmentRefs: ReactRelayPaginationContainerTestNoConnectionOnFragmentViewerFragment$ref,
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

module.exports = node;
