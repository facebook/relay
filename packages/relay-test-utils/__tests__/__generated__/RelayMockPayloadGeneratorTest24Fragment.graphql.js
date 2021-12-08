/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<7da1a7d32e90872a5eb8befef87c4927>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest24Fragment$fragmentType: FragmentType;
export type RelayMockPayloadGeneratorTest24Fragment$ref = RelayMockPayloadGeneratorTest24Fragment$fragmentType;
export type RelayMockPayloadGeneratorTest24Fragment$data = {|
  +id: string,
  +name: ?string,
  +$fragmentType: RelayMockPayloadGeneratorTest24Fragment$fragmentType,
|};
export type RelayMockPayloadGeneratorTest24Fragment = RelayMockPayloadGeneratorTest24Fragment$data;
export type RelayMockPayloadGeneratorTest24Fragment$key = {
  +$data?: RelayMockPayloadGeneratorTest24Fragment$data,
  +$fragmentSpreads: RelayMockPayloadGeneratorTest24Fragment$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  RelayMockPayloadGeneratorTest24Fragment$fragmentType,
  RelayMockPayloadGeneratorTest24Fragment$data,
>*/);
