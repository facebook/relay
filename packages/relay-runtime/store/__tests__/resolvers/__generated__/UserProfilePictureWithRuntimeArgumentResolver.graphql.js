/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<a786bf313b1408e6ff51aa64a71957de>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type UserProfilePictureWithRuntimeArgumentResolver$fragmentType: FragmentType;
export type UserProfilePictureWithRuntimeArgumentResolver$data = {|
  +profile_picture: ?{|
    +uri: ?string,
  |},
  +$fragmentType: UserProfilePictureWithRuntimeArgumentResolver$fragmentType,
|};
export type UserProfilePictureWithRuntimeArgumentResolver$key = {
  +$data?: UserProfilePictureWithRuntimeArgumentResolver$data,
  +$fragmentSpreads: UserProfilePictureWithRuntimeArgumentResolver$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "scale"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "UserProfilePictureWithRuntimeArgumentResolver",
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
  (node/*:: as any*/).hash = "ca860e294e4da4da8f4e1354107dfd51";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  UserProfilePictureWithRuntimeArgumentResolver$fragmentType,
  UserProfilePictureWithRuntimeArgumentResolver$data,
>*/);
