/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<a8883394d940051f13ae727d08a33382>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayReaderTestCreatesFragmentPointersWithVariableArgumentsUserProfilePicture$ref: FragmentReference;
declare export opaque type RelayReaderTestCreatesFragmentPointersWithVariableArgumentsUserProfilePicture$fragmentType: RelayReaderTestCreatesFragmentPointersWithVariableArgumentsUserProfilePicture$ref;
export type RelayReaderTestCreatesFragmentPointersWithVariableArgumentsUserProfilePicture = {|
  +profilePicture: ?{|
    +uri: ?string,
  |},
  +$refType: RelayReaderTestCreatesFragmentPointersWithVariableArgumentsUserProfilePicture$ref,
|};
export type RelayReaderTestCreatesFragmentPointersWithVariableArgumentsUserProfilePicture$data = RelayReaderTestCreatesFragmentPointersWithVariableArgumentsUserProfilePicture;
export type RelayReaderTestCreatesFragmentPointersWithVariableArgumentsUserProfilePicture$key = {
  +$data?: RelayReaderTestCreatesFragmentPointersWithVariableArgumentsUserProfilePicture$data,
  +$fragmentRefs: RelayReaderTestCreatesFragmentPointersWithVariableArgumentsUserProfilePicture$ref,
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

module.exports = node;
