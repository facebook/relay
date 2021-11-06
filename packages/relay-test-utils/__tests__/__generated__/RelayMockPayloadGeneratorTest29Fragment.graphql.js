/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<9ff95dd9276f50edf5c04549c490a5a0>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest29Fragment$ref: FragmentReference;
declare export opaque type RelayMockPayloadGeneratorTest29Fragment$fragmentType: RelayMockPayloadGeneratorTest29Fragment$ref;
export type RelayMockPayloadGeneratorTest29Fragment = {|
  +id: string,
  +pageName: ?string,
  +$refType: RelayMockPayloadGeneratorTest29Fragment$ref,
|};
export type RelayMockPayloadGeneratorTest29Fragment$data = RelayMockPayloadGeneratorTest29Fragment;
export type RelayMockPayloadGeneratorTest29Fragment$key = {
  +$data?: RelayMockPayloadGeneratorTest29Fragment$data,
  +$fragmentRefs: RelayMockPayloadGeneratorTest29Fragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayMockPayloadGeneratorTest29Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "alias": "pageName",
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    }
  ],
  "type": "Page",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "6c2f0ef36ab5cc0d9063e2db9d68492e";
}

module.exports = node;
