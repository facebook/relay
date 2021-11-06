/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<de417f5652c13c3239f67fd64c2c8a10>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest4Fragment$ref: FragmentReference;
declare export opaque type RelayMockPayloadGeneratorTest4Fragment$fragmentType: RelayMockPayloadGeneratorTest4Fragment$ref;
export type RelayMockPayloadGeneratorTest4Fragment = {|
  +name: ?string,
  +username: ?string,
  +emailAddresses: ?$ReadOnlyArray<?string>,
  +$refType: RelayMockPayloadGeneratorTest4Fragment$ref,
|};
export type RelayMockPayloadGeneratorTest4Fragment$data = RelayMockPayloadGeneratorTest4Fragment;
export type RelayMockPayloadGeneratorTest4Fragment$key = {
  +$data?: RelayMockPayloadGeneratorTest4Fragment$data,
  +$fragmentRefs: RelayMockPayloadGeneratorTest4Fragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayMockPayloadGeneratorTest4Fragment",
  "selections": [
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
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "emailAddresses",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "c583c180a55fea0b0b4787ba9adc3642";
}

module.exports = node;
