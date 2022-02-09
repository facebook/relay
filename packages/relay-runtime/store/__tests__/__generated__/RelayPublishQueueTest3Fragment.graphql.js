/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<c35a7c26b1266bc4ad33f0878784fe89>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayPublishQueueTest3Fragment$fragmentType: FragmentType;
export type RelayPublishQueueTest3Fragment$data = {|
  +username: ?string,
  +$fragmentType: RelayPublishQueueTest3Fragment$fragmentType,
|};
export type RelayPublishQueueTest3Fragment$key = {
  +$data?: RelayPublishQueueTest3Fragment$data,
  +$fragmentSpreads: RelayPublishQueueTest3Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayPublishQueueTest3Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "username",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "cf8735d5f0d1f561357f0feeee0f04db";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayPublishQueueTest3Fragment$fragmentType,
  RelayPublishQueueTest3Fragment$data,
>*/);
