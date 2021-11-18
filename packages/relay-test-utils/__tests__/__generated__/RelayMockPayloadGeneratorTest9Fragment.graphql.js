/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<b0a3bd97462d141dad3d799f20a5b489>>
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
export type RelayMockPayloadGeneratorTest9Fragment$ref = RelayMockPayloadGeneratorTest9Fragment$fragmentType;
export type RelayMockPayloadGeneratorTest9Fragment$data = {|
  +actor: ?{|
    +id: string,
    +name: ?string,
  |},
  +$fragmentType: RelayMockPayloadGeneratorTest9Fragment$fragmentType,
|};
export type RelayMockPayloadGeneratorTest9Fragment = RelayMockPayloadGeneratorTest9Fragment$data;
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
