/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<71f40913925a736f7bc770502a400b82>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableProfilePicture$fragmentType: FragmentType;
export type RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableProfilePicture$data = {|
  +id: string,
  +profilePicture: ?{|
    +uri: ?string,
  |},
  +$fragmentType: RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableProfilePicture$fragmentType,
|};
export type RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableProfilePicture$key = {
  +$data?: RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableProfilePicture$data,
  +$fragmentSpreads: RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableProfilePicture$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableProfilePicture$fragmentType,
  RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableProfilePicture$data,
>*/);
