/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<05d635030c8cf95ac5f389fc1fa09a0c>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest_fragment59$fragmentType: FragmentType;
export type RelayMockPayloadGeneratorTest_fragment59$data = {|
  +id: string,
  +name?: ?string,
  +$fragmentType: RelayMockPayloadGeneratorTest_fragment59$fragmentType,
|};
export type RelayMockPayloadGeneratorTest_fragment59$key = {
  +$data?: RelayMockPayloadGeneratorTest_fragment59$data,
  +$fragmentSpreads: RelayMockPayloadGeneratorTest_fragment59$fragmentType,
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
  "name": "RelayMockPayloadGeneratorTest_fragment59",
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
  (node/*: any*/).hash = "efeafd8b46bc5e1d5e9deb6e69637ccc";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayMockPayloadGeneratorTest_fragment59$fragmentType,
  RelayMockPayloadGeneratorTest_fragment59$data,
>*/);
