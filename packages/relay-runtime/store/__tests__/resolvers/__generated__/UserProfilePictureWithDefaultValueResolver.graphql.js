/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<57a6dd46541e44fa0bafc17a272d907b>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type UserProfilePictureWithDefaultValueResolver$fragmentType: FragmentType;
export type UserProfilePictureWithDefaultValueResolver$data = {
  readonly profile_picture: ?{
    readonly uri: ?string,
  },
  readonly $fragmentType: UserProfilePictureWithDefaultValueResolver$fragmentType,
};
export type UserProfilePictureWithDefaultValueResolver$key = {
  readonly $data?: UserProfilePictureWithDefaultValueResolver$data,
  readonly $fragmentSpreads: UserProfilePictureWithDefaultValueResolver$fragmentType,
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
  (node/*:: as any*/).hash = "e32945ab29746a034431ebecadc8a7b2";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  UserProfilePictureWithDefaultValueResolver$fragmentType,
  UserProfilePictureWithDefaultValueResolver$data,
>*/);
