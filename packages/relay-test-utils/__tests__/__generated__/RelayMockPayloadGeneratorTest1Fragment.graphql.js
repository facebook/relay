/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<057446f1fbc5205b01c85ae643a9e463>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest1Fragment$fragmentType: FragmentType;
export type RelayMockPayloadGeneratorTest1Fragment$ref = RelayMockPayloadGeneratorTest1Fragment$fragmentType;
export type RelayMockPayloadGeneratorTest1Fragment$data = {|
  +id: string,
  +name?: ?string,
  +firstName?: ?string,
  +lastName?: ?string,
  +websites?: ?$ReadOnlyArray<?string>,
  +$fragmentType: RelayMockPayloadGeneratorTest1Fragment$fragmentType,
|};
export type RelayMockPayloadGeneratorTest1Fragment = RelayMockPayloadGeneratorTest1Fragment$data;
export type RelayMockPayloadGeneratorTest1Fragment$key = {
  +$data?: RelayMockPayloadGeneratorTest1Fragment$data,
  +$fragmentSpreads: RelayMockPayloadGeneratorTest1Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayMockPayloadGeneratorTest1Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "name",
          "storageKey": null
        }
      ],
      "type": "Named",
      "abstractKey": "__isNamed"
    },
    {
      "kind": "InlineFragment",
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "firstName",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "lastName",
          "storageKey": null
        }
      ],
      "type": "User",
      "abstractKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "websites",
          "storageKey": null
        }
      ],
      "type": "Page",
      "abstractKey": null
    }
  ],
  "type": "Actor",
  "abstractKey": "__isActor"
};

if (__DEV__) {
  (node/*: any*/).hash = "655e53b1e06b621fffd25ad651fdad29";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayMockPayloadGeneratorTest1Fragment$fragmentType,
  RelayMockPayloadGeneratorTest1Fragment$data,
>*/);
