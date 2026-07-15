/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<ff6e0fc5896f4013d57dc6a2ca50157c>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayPublishQueueTest1Fragment$fragmentType: FragmentType;
export type RelayPublishQueueTest1Fragment$data = {
  readonly username: ?string,
  readonly $fragmentType: RelayPublishQueueTest1Fragment$fragmentType,
};
export type RelayPublishQueueTest1Fragment$key = {
  readonly $data?: RelayPublishQueueTest1Fragment$data,
  readonly $fragmentSpreads: RelayPublishQueueTest1Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayPublishQueueTest1Fragment",
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
  (node/*:: as any*/).hash = "f9d2dce604839d0e64efdff9b7c9ce23";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayPublishQueueTest1Fragment$fragmentType,
  RelayPublishQueueTest1Fragment$data,
>*/);
