/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<07ff34b30d7be47e77a66a2b6e35246a>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingUserProfile$fragmentType: FragmentType;
export type RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingUserProfile$data = {
  readonly id: string,
  readonly username: ?string,
  readonly $fragmentType: RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingUserProfile$fragmentType,
};
export type RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingUserProfile$key = {
  readonly $data?: RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingUserProfile$data,
  readonly $fragmentSpreads: RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingUserProfile$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingUserProfile",
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
      "name": "username",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "e02035b1843ef7dc76c90e27f2d7e190";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingUserProfile$fragmentType,
  RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingUserProfile$data,
>*/);
