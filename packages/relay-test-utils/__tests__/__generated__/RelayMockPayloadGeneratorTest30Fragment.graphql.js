/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<776ac7ff7be47feb7f473880295dd055>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest30Fragment$ref: FragmentReference;
declare export opaque type RelayMockPayloadGeneratorTest30Fragment$fragmentType: RelayMockPayloadGeneratorTest30Fragment$ref;
export type RelayMockPayloadGeneratorTest30Fragment = {|
  +id: string,
  +userName: ?string,
  +$refType: RelayMockPayloadGeneratorTest30Fragment$ref,
|};
export type RelayMockPayloadGeneratorTest30Fragment$data = RelayMockPayloadGeneratorTest30Fragment;
export type RelayMockPayloadGeneratorTest30Fragment$key = {
  +$data?: RelayMockPayloadGeneratorTest30Fragment$data,
  +$fragmentRefs: RelayMockPayloadGeneratorTest30Fragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayMockPayloadGeneratorTest30Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "alias": "userName",
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
  (node/*: any*/).hash = "3677bb2a7a0b0d2733643212c412e05d";
}

module.exports = node;
