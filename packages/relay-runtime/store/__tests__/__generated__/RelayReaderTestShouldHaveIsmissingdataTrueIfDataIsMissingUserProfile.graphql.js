/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<29f69a5c2b6c451ab3eba27c731ff0af>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingUserProfile$fragmentType: FragmentType;
export type RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingUserProfile$data = {|
  +id: string,
  +username: ?string,
  +$fragmentType: RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingUserProfile$fragmentType,
|};
export type RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingUserProfile$key = {
  +$data?: RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingUserProfile$data,
  +$fragmentSpreads: RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingUserProfile$fragmentType,
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
  (node/*: any*/).hash = "e02035b1843ef7dc76c90e27f2d7e190";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingUserProfile$fragmentType,
  RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingUserProfile$data,
>*/);
