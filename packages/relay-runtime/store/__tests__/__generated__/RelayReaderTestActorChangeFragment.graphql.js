/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<343c7a37ac7149cc77e5b6fef7891087>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReaderTestActorChangeFragment$fragmentType: FragmentType;
export type RelayReaderTestActorChangeFragment$data = {|
  +name: ?string,
  +$fragmentType: RelayReaderTestActorChangeFragment$fragmentType,
|};
export type RelayReaderTestActorChangeFragment$key = {
  +$data?: RelayReaderTestActorChangeFragment$data,
  +$fragmentSpreads: RelayReaderTestActorChangeFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayReaderTestActorChangeFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "fd02a74ad0fea268d2dc732ad2d56c26";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayReaderTestActorChangeFragment$fragmentType,
  RelayReaderTestActorChangeFragment$data,
>*/);
