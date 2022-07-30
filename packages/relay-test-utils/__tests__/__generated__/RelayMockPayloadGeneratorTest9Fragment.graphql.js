/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<54f8cdf6f4b4f188037c8eed3a9c13ab>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest9Fragment$fragmentType: FragmentType;
export type RelayMockPayloadGeneratorTest9Fragment$data = {|
  +actor: ?{|
    +id: string,
    +name: ?string,
  |},
  +$fragmentType: RelayMockPayloadGeneratorTest9Fragment$fragmentType,
|};
export type RelayMockPayloadGeneratorTest9Fragment$key = {
  +$data?: RelayMockPayloadGeneratorTest9Fragment$data,
  +$fragmentSpreads: RelayMockPayloadGeneratorTest9Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayMockPayloadGeneratorTest9Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "actor",
      "plural": false,
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
      "storageKey": null
    }
  ],
  "type": "Page",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "44a42bf08c7f46d66efaff297f4e7066";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayMockPayloadGeneratorTest9Fragment$fragmentType,
  RelayMockPayloadGeneratorTest9Fragment$data,
>*/);
