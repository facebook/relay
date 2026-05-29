/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<0a21b2dfb8b10435778cc20144082996>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserProfilePicture$fragmentType } from "./RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserProfilePicture.graphql";
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserProfile$fragmentType: FragmentType;
export type RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserProfile$data = {
  readonly id: string,
  readonly $fragmentSpreads: RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserProfilePicture$fragmentType,
  readonly $fragmentType: RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserProfile$fragmentType,
};
export type RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserProfile$key = {
  readonly $data?: RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserProfile$data,
  readonly $fragmentSpreads: RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserProfile$fragmentType,
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
  (node/*:: as any*/).hash = "b1806f52e4f97679d4a3232f348aeee1";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserProfile$fragmentType,
  RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserProfile$data,
>*/);
