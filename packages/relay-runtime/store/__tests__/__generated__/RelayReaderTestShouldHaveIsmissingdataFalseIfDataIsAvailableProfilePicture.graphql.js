/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<09fda6cf0f8adcc2f0da8c05f7eed9c3>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableProfilePicture$ref: FragmentReference;
declare export opaque type RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableProfilePicture$fragmentType: RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableProfilePicture$ref;
export type RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableProfilePicture = {|
  +id: string,
  +profilePicture: ?{|
    +uri: ?string,
  |},
  +$refType: RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableProfilePicture$ref,
|};
export type RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableProfilePicture$data = RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableProfilePicture;
export type RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableProfilePicture$key = {
  +$data?: RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableProfilePicture$data,
  +$fragmentRefs: RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableProfilePicture$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "size"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableProfilePicture",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
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
  (node/*: any*/).hash = "2f4de82999fbf30021bd6609f5500a31";
}

module.exports = node;
