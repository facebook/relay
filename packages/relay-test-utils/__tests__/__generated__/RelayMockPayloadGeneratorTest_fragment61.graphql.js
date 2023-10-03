/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<699a048863dd7792d83ed44763f446ed>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest_fragment61$fragmentType: FragmentType;
export type RelayMockPayloadGeneratorTest_fragment61$data = {|
  +id: string,
  +name?: ?string,
  +$fragmentType: RelayMockPayloadGeneratorTest_fragment61$fragmentType,
|};
export type RelayMockPayloadGeneratorTest_fragment61$key = {
  +$data?: RelayMockPayloadGeneratorTest_fragment61$data,
  +$fragmentSpreads: RelayMockPayloadGeneratorTest_fragment61$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "defaultValue": false,
      "kind": "LocalArgument",
      "name": "cond"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayMockPayloadGeneratorTest_fragment61",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "condition": "cond",
      "kind": "Condition",
      "passingValue": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "name",
          "storageKey": null
        }
      ]
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "25e64d959ac400af76cce1c64d022f38";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayMockPayloadGeneratorTest_fragment61$fragmentType,
  RelayMockPayloadGeneratorTest_fragment61$data,
>*/);
