/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<e54ebf5c9d75782618354337ff5ecd7e>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayPublishQueueTest1Fragment$ref: FragmentReference;
declare export opaque type RelayPublishQueueTest1Fragment$fragmentType: RelayPublishQueueTest1Fragment$ref;
export type RelayPublishQueueTest1Fragment = {|
  +username: ?string,
  +$refType: RelayPublishQueueTest1Fragment$ref,
|};
export type RelayPublishQueueTest1Fragment$data = RelayPublishQueueTest1Fragment;
export type RelayPublishQueueTest1Fragment$key = {
  +$data?: RelayPublishQueueTest1Fragment$data,
  +$fragmentRefs: RelayPublishQueueTest1Fragment$ref,
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

module.exports = node;
