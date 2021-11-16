/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<5280d5b3e84c6f8ec479ac003047c2f5>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest29Fragment$fragmentType: FragmentType;
export type RelayMockPayloadGeneratorTest29Fragment$ref = RelayMockPayloadGeneratorTest29Fragment$fragmentType;
export type RelayMockPayloadGeneratorTest29Fragment$data = {|
  +id: string,
  +pageName: ?string,
  +$refType: RelayMockPayloadGeneratorTest29Fragment$fragmentType,
  +$fragmentType: RelayMockPayloadGeneratorTest29Fragment$fragmentType,
|};
export type RelayMockPayloadGeneratorTest29Fragment = RelayMockPayloadGeneratorTest29Fragment$data;
export type RelayMockPayloadGeneratorTest29Fragment$key = {
  +$data?: RelayMockPayloadGeneratorTest29Fragment$data,
  +$fragmentRefs: RelayMockPayloadGeneratorTest29Fragment$fragmentType,
  +$fragmentSpreads: RelayMockPayloadGeneratorTest29Fragment$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  RelayMockPayloadGeneratorTest29Fragment$fragmentType,
  RelayMockPayloadGeneratorTest29Fragment$data,
>*/);
