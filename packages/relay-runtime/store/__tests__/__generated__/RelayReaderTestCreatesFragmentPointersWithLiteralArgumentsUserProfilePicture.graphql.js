/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<e144f5311b665ac664ca751a5c119728>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserProfilePicture$fragmentType: FragmentType;
export type RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserProfilePicture$ref = RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserProfilePicture$fragmentType;
export type RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserProfilePicture$data = {|
  +profilePicture: ?{|
    +uri: ?string,
  |},
  +$fragmentType: RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserProfilePicture$fragmentType,
|};
export type RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserProfilePicture = RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserProfilePicture$data;
export type RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserProfilePicture$key = {
  +$data?: RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserProfilePicture$data,
  +$fragmentSpreads: RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserProfilePicture$fragmentType,
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
  "name": "RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserProfilePicture",
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
  (node/*: any*/).hash = "0abd66caa70cff7ec4fe12513968f319";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserProfilePicture$fragmentType,
  RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserProfilePicture$data,
>*/);
