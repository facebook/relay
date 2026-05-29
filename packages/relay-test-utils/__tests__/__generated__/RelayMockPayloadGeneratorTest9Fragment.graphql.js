/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<19459bfef5518fb15bfbb44b925d2b08>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest9Fragment$fragmentType: FragmentType;
export type RelayMockPayloadGeneratorTest9Fragment$data = {
  readonly actor: ?{
    readonly id: string,
    readonly name: ?string,
  },
  readonly $fragmentType: RelayMockPayloadGeneratorTest9Fragment$fragmentType,
};
export type RelayMockPayloadGeneratorTest9Fragment$key = {
  readonly $data?: RelayMockPayloadGeneratorTest9Fragment$data,
  readonly $fragmentSpreads: RelayMockPayloadGeneratorTest9Fragment$fragmentType,
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
  (node/*:: as any*/).hash = "44a42bf08c7f46d66efaff297f4e7066";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayMockPayloadGeneratorTest9Fragment$fragmentType,
  RelayMockPayloadGeneratorTest9Fragment$data,
>*/);
