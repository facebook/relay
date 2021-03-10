/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<775da07163ce57e7d9199fde1d307445>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest18Fragment$ref: FragmentReference;
declare export opaque type RelayMockPayloadGeneratorTest18Fragment$fragmentType: RelayMockPayloadGeneratorTest18Fragment$ref;
export type RelayMockPayloadGeneratorTest18Fragment = {|
  +id: string,
  +name: ?string,
  +username: ?string,
  +$refType: RelayMockPayloadGeneratorTest18Fragment$ref,
|};
export type RelayMockPayloadGeneratorTest18Fragment$data = RelayMockPayloadGeneratorTest18Fragment;
export type RelayMockPayloadGeneratorTest18Fragment$key = {
  +$data?: RelayMockPayloadGeneratorTest18Fragment$data,
  +$fragmentRefs: RelayMockPayloadGeneratorTest18Fragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayMockPayloadGeneratorTest18Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    },
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
  (node/*: any*/).hash = "76104cba704e4b97b50a9771c640409d";
}

module.exports = node;
