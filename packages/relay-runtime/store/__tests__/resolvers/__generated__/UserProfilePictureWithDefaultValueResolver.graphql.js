/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<596a7e2c42b47845e7f1dbf5b84f2dc1>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type UserProfilePictureWithDefaultValueResolver$fragmentType: FragmentType;
export type UserProfilePictureWithDefaultValueResolver$data = {|
  +profile_picture: ?{|
    +uri: ?string,
  |},
  +$fragmentType: UserProfilePictureWithDefaultValueResolver$fragmentType,
|};
export type UserProfilePictureWithDefaultValueResolver$key = {
  +$data?: UserProfilePictureWithDefaultValueResolver$data,
  +$fragmentSpreads: UserProfilePictureWithDefaultValueResolver$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "defaultValue": 1.5,
      "kind": "LocalArgument",
      "name": "scale"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "UserProfilePictureWithDefaultValueResolver",
  "selections": [
    {
      "alias": null,
      "args": [
        {
          "kind": "Variable",
          "name": "scale",
          "variableName": "scale"
        }
      ],
      "concreteType": "Image",
      "kind": "LinkedField",
      "name": "profile_picture",
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
  (node/*: any*/).hash = "e32945ab29746a034431ebecadc8a7b2";
}

module.exports = ((node/*: any*/)/*: Fragment<
  UserProfilePictureWithDefaultValueResolver$fragmentType,
  UserProfilePictureWithDefaultValueResolver$data,
>*/);
