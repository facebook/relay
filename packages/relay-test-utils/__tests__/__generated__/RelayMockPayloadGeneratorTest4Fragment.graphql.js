/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<e7d4b8d2cbdb4574e58db17f6981ed81>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest4Fragment$fragmentType: FragmentType;
export type RelayMockPayloadGeneratorTest4Fragment$ref = RelayMockPayloadGeneratorTest4Fragment$fragmentType;
export type RelayMockPayloadGeneratorTest4Fragment$data = {|
  +name: ?string,
  +username: ?string,
  +emailAddresses: ?$ReadOnlyArray<?string>,
  +$fragmentType: RelayMockPayloadGeneratorTest4Fragment$fragmentType,
|};
export type RelayMockPayloadGeneratorTest4Fragment = RelayMockPayloadGeneratorTest4Fragment$data;
export type RelayMockPayloadGeneratorTest4Fragment$key = {
  +$data?: RelayMockPayloadGeneratorTest4Fragment$data,
  +$fragmentSpreads: RelayMockPayloadGeneratorTest4Fragment$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  RelayMockPayloadGeneratorTest4Fragment$fragmentType,
  RelayMockPayloadGeneratorTest4Fragment$data,
>*/);
