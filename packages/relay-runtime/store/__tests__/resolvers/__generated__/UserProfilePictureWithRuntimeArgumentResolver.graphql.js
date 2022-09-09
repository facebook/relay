/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<ae04ff47f45e21cdc7171282865c47d4>>
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
  (node/*: any*/).hash = "ca860e294e4da4da8f4e1354107dfd51";
}

module.exports = ((node/*: any*/)/*: Fragment<
  UserProfilePictureWithRuntimeArgumentResolver$fragmentType,
  UserProfilePictureWithRuntimeArgumentResolver$data,
>*/);
