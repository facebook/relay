/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<6f6eac9a988da049301ba2323550f81d>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
type RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserProfilePicture$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserProfile$ref: FragmentReference;
declare export opaque type RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserProfile$fragmentType: RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserProfile$ref;
export type RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserProfile = {|
  +id: string,
  +$fragmentRefs: RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserProfilePicture$ref,
  +$refType: RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserProfile$ref,
|};
export type RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserProfile$data = RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserProfile;
export type RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserProfile$key = {
  +$data?: RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserProfile$data,
  +$fragmentRefs: RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserProfile$ref,
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

module.exports = node;
