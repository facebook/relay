/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<e9ebb661e805b9044981146c5d578524>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayPublishQueueTest3Fragment$ref: FragmentReference;
declare export opaque type RelayPublishQueueTest3Fragment$fragmentType: RelayPublishQueueTest3Fragment$ref;
export type RelayPublishQueueTest3Fragment = {|
  +username: ?string,
  +$refType: RelayPublishQueueTest3Fragment$ref,
|};
export type RelayPublishQueueTest3Fragment$data = RelayPublishQueueTest3Fragment;
export type RelayPublishQueueTest3Fragment$key = {
  +$data?: RelayPublishQueueTest3Fragment$data,
  +$fragmentRefs: RelayPublishQueueTest3Fragment$ref,
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

module.exports = node;
