/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<74a2f1f060e1b44ea391d4ad5e2f5f52>>
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
export type RelayPublishQueueTest3Fragment$ref = RelayPublishQueueTest3Fragment$fragmentType;
export type RelayPublishQueueTest3Fragment$data = {|
  +username: ?string,
  +$refType: RelayPublishQueueTest3Fragment$fragmentType,
  +$fragmentType: RelayPublishQueueTest3Fragment$fragmentType,
|};
export type RelayPublishQueueTest3Fragment = RelayPublishQueueTest3Fragment$data;
export type RelayPublishQueueTest3Fragment$key = {
  +$data?: RelayPublishQueueTest3Fragment$data,
  +$fragmentRefs: RelayPublishQueueTest3Fragment$fragmentType,
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
