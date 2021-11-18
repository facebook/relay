/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<300d6f1a797688538a5f71d091cf7a13>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayPublishQueueTest1Fragment$fragmentType: FragmentType;
export type RelayPublishQueueTest1Fragment$ref = RelayPublishQueueTest1Fragment$fragmentType;
export type RelayPublishQueueTest1Fragment$data = {|
  +username: ?string,
  +$fragmentType: RelayPublishQueueTest1Fragment$fragmentType,
|};
export type RelayPublishQueueTest1Fragment = RelayPublishQueueTest1Fragment$data;
export type RelayPublishQueueTest1Fragment$key = {
  +$data?: RelayPublishQueueTest1Fragment$data,
  +$fragmentSpreads: RelayPublishQueueTest1Fragment$fragmentType,
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
  (node/*: any*/).hash = "f9d2dce604839d0e64efdff9b7c9ce23";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayPublishQueueTest1Fragment$fragmentType,
  RelayPublishQueueTest1Fragment$data,
>*/);
