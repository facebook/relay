/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<0c95952672ff2230fc0999af05276d12>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserProfilePicture$ref: FragmentReference;
declare export opaque type RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserProfilePicture$fragmentType: RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserProfilePicture$ref;
export type RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserProfilePicture = {|
  +profilePicture: ?{|
    +uri: ?string,
  |},
  +$refType: RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserProfilePicture$ref,
|};
export type RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserProfilePicture$data = RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserProfilePicture;
export type RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserProfilePicture$key = {
  +$data?: RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserProfilePicture$data,
  +$fragmentRefs: RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserProfilePicture$ref,
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

module.exports = node;
