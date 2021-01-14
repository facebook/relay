/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<8574abd4b897f52b38fb53f6d8939d68>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
type RelayReaderTestCreatesFragmentPointersWithVariableArgumentsUserProfilePicture$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayReaderTestCreatesFragmentPointersWithVariableArgumentsUserProfile$ref: FragmentReference;
declare export opaque type RelayReaderTestCreatesFragmentPointersWithVariableArgumentsUserProfile$fragmentType: RelayReaderTestCreatesFragmentPointersWithVariableArgumentsUserProfile$ref;
export type RelayReaderTestCreatesFragmentPointersWithVariableArgumentsUserProfile = {|
  +id: string,
  +$fragmentRefs: RelayReaderTestCreatesFragmentPointersWithVariableArgumentsUserProfilePicture$ref,
  +$refType: RelayReaderTestCreatesFragmentPointersWithVariableArgumentsUserProfile$ref,
|};
export type RelayReaderTestCreatesFragmentPointersWithVariableArgumentsUserProfile$data = RelayReaderTestCreatesFragmentPointersWithVariableArgumentsUserProfile;
export type RelayReaderTestCreatesFragmentPointersWithVariableArgumentsUserProfile$key = {
  +$data?: RelayReaderTestCreatesFragmentPointersWithVariableArgumentsUserProfile$data,
  +$fragmentRefs: RelayReaderTestCreatesFragmentPointersWithVariableArgumentsUserProfile$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "size"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayReaderTestCreatesFragmentPointersWithVariableArgumentsUserProfile",
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
          "kind": "Variable",
          "name": "size",
          "variableName": "size"
        }
      ],
      "kind": "FragmentSpread",
      "name": "RelayReaderTestCreatesFragmentPointersWithVariableArgumentsUserProfilePicture"
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "bd85ac2b22bc3ee38c9b93d0fd32ee60";
}

module.exports = node;
