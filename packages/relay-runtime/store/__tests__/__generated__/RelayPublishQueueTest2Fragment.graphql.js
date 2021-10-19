/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<d9c4d8d07981e35fb2b35b79e614d2fc>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayPublishQueueTest2Fragment$ref: FragmentReference;
declare export opaque type RelayPublishQueueTest2Fragment$fragmentType: RelayPublishQueueTest2Fragment$ref;
export type RelayPublishQueueTest2Fragment = {|
  +username: ?string,
  +$refType: RelayPublishQueueTest2Fragment$ref,
|};
export type RelayPublishQueueTest2Fragment$data = RelayPublishQueueTest2Fragment;
export type RelayPublishQueueTest2Fragment$key = {
  +$data?: RelayPublishQueueTest2Fragment$data,
  +$fragmentRefs: RelayPublishQueueTest2Fragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayPublishQueueTest2Fragment",
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
  (node/*: any*/).hash = "52a36fbd5032220f651acbfdc2346730";
}

module.exports = node;
