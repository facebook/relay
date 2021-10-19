/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<393af865578e3303af92c6b58bb6434d>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest24Fragment$ref: FragmentReference;
declare export opaque type RelayMockPayloadGeneratorTest24Fragment$fragmentType: RelayMockPayloadGeneratorTest24Fragment$ref;
export type RelayMockPayloadGeneratorTest24Fragment = {|
  +id: string,
  +name: ?string,
  +$refType: RelayMockPayloadGeneratorTest24Fragment$ref,
|};
export type RelayMockPayloadGeneratorTest24Fragment$data = RelayMockPayloadGeneratorTest24Fragment;
export type RelayMockPayloadGeneratorTest24Fragment$key = {
  +$data?: RelayMockPayloadGeneratorTest24Fragment$data,
  +$fragmentRefs: RelayMockPayloadGeneratorTest24Fragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayMockPayloadGeneratorTest24Fragment",
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
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "e29b53fb154bf20e59f8bd2c7c82e771";
}

module.exports = node;
