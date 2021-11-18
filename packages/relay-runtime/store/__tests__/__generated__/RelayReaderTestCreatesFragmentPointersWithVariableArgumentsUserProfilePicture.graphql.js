/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<d0a486f9cf801882c16f1415e1ff810f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReaderTestCreatesFragmentPointersWithVariableArgumentsUserProfilePicture$fragmentType: FragmentType;
export type RelayReaderTestCreatesFragmentPointersWithVariableArgumentsUserProfilePicture$ref = RelayReaderTestCreatesFragmentPointersWithVariableArgumentsUserProfilePicture$fragmentType;
export type RelayReaderTestCreatesFragmentPointersWithVariableArgumentsUserProfilePicture$data = {|
  +profilePicture: ?{|
    +uri: ?string,
  |},
  +$fragmentType: RelayReaderTestCreatesFragmentPointersWithVariableArgumentsUserProfilePicture$fragmentType,
|};
export type RelayReaderTestCreatesFragmentPointersWithVariableArgumentsUserProfilePicture = RelayReaderTestCreatesFragmentPointersWithVariableArgumentsUserProfilePicture$data;
export type RelayReaderTestCreatesFragmentPointersWithVariableArgumentsUserProfilePicture$key = {
  +$data?: RelayReaderTestCreatesFragmentPointersWithVariableArgumentsUserProfilePicture$data,
  +$fragmentSpreads: RelayReaderTestCreatesFragmentPointersWithVariableArgumentsUserProfilePicture$fragmentType,
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
  "name": "RelayReaderTestCreatesFragmentPointersWithVariableArgumentsUserProfilePicture",
  "selections": [
    {
      "alias": null,
      "args": [
        {
          "kind": "Variable",
          "name": "size",
          "variableName": "size"
        }
      ],
      "concreteType": "Image",
      "kind": "LinkedField",
      "name": "profilePicture",
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
  (node/*: any*/).hash = "d976969d08d009ce0e4babeccc04476a";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayReaderTestCreatesFragmentPointersWithVariableArgumentsUserProfilePicture$fragmentType,
  RelayReaderTestCreatesFragmentPointersWithVariableArgumentsUserProfilePicture$data,
>*/);
