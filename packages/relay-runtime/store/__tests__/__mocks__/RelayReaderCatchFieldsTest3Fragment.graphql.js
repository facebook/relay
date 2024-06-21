/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReaderCatchFieldsTest3Fragment$fragmentType: FragmentType;
export type RelayReaderCatchFieldsTest3Fragment$data = {|
  +profilePicture: ?{|
    +uri: ?string,
  |},
  +$fragmentType: RelayReaderCatchFieldsTest3Fragment$fragmentType,
|};
export type RelayReaderCatchFieldsTest3Fragment$key = {
  +$data?: RelayReaderCatchFieldsTest3Fragment$data,
  +$fragmentSpreads: RelayReaderCatchFieldsTest3Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayReaderCatchFieldsTest3Fragment",
  "selections": [
    {
      "alias": "profilePicture",
      "args": null,
      "concreteType": "Image",
      "kind": "LinkedField",
      "name": "__profilePicture_test",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "uri",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "9a91f81e017f3267c21ec7f465854acf";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayReaderCatchFieldsTest3Fragment$fragmentType,
  RelayReaderCatchFieldsTest3Fragment$data,
>*/);
