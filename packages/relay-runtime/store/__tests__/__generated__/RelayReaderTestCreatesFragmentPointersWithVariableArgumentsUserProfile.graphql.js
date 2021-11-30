/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<17028ebf6dfce81aaa174b292be974b5>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
type RelayReaderTestCreatesFragmentPointersWithVariableArgumentsUserProfilePicture$fragmentType = any;
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReaderTestCreatesFragmentPointersWithVariableArgumentsUserProfile$fragmentType: FragmentType;
export type RelayReaderTestCreatesFragmentPointersWithVariableArgumentsUserProfile$ref = RelayReaderTestCreatesFragmentPointersWithVariableArgumentsUserProfile$fragmentType;
export type RelayReaderTestCreatesFragmentPointersWithVariableArgumentsUserProfile$data = {|
  +id: string,
  +$fragmentSpreads: RelayReaderTestCreatesFragmentPointersWithVariableArgumentsUserProfilePicture$fragmentType,
  +$fragmentType: RelayReaderTestCreatesFragmentPointersWithVariableArgumentsUserProfile$fragmentType,
|};
export type RelayReaderTestCreatesFragmentPointersWithVariableArgumentsUserProfile = RelayReaderTestCreatesFragmentPointersWithVariableArgumentsUserProfile$data;
export type RelayReaderTestCreatesFragmentPointersWithVariableArgumentsUserProfile$key = {
  +$data?: RelayReaderTestCreatesFragmentPointersWithVariableArgumentsUserProfile$data,
  +$fragmentSpreads: RelayReaderTestCreatesFragmentPointersWithVariableArgumentsUserProfile$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  RelayReaderTestCreatesFragmentPointersWithVariableArgumentsUserProfile$fragmentType,
  RelayReaderTestCreatesFragmentPointersWithVariableArgumentsUserProfile$data,
>*/);
