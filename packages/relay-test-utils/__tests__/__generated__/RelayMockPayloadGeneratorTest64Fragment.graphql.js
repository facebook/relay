/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<80259745704bf22d349ae4e6e55bc886>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest64Fragment$fragmentType: FragmentType;
export type RelayMockPayloadGeneratorTest64Fragment$data = {|
  +id: string,
  +$fragmentType: RelayMockPayloadGeneratorTest64Fragment$fragmentType,
|};
export type RelayMockPayloadGeneratorTest64Fragment$key = {
  +$data?: RelayMockPayloadGeneratorTest64Fragment$data,
  +$fragmentSpreads: RelayMockPayloadGeneratorTest64Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayMockPayloadGeneratorTest64Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "9ba464667e581d8c4e01b05d763cdc0c";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayMockPayloadGeneratorTest64Fragment$fragmentType,
  RelayMockPayloadGeneratorTest64Fragment$data,
>*/);
