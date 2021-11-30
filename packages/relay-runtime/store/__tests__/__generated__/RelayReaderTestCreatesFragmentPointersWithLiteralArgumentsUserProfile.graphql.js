/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<125b2d3c702a8fc24a6957e88e38233f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
type RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserProfilePicture$fragmentType = any;
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserProfile$fragmentType: FragmentType;
export type RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserProfile$ref = RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserProfile$fragmentType;
export type RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserProfile$data = {|
  +id: string,
  +$fragmentSpreads: RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserProfilePicture$fragmentType,
  +$fragmentType: RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserProfile$fragmentType,
|};
export type RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserProfile = RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserProfile$data;
export type RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserProfile$key = {
  +$data?: RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserProfile$data,
  +$fragmentSpreads: RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserProfile$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserProfile",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "args": [
        {
          "kind": "Literal",
          "name": "size",
          "value": 42
        }
      ],
      "kind": "FragmentSpread",
      "name": "RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserProfilePicture"
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "b1806f52e4f97679d4a3232f348aeee1";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserProfile$fragmentType,
  RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserProfile$data,
>*/);
