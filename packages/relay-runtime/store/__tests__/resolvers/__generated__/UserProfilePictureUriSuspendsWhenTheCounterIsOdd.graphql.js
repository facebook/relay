/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<a3d19d0795b1f01277ebdcbdeb94f075>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { UserGreetingResolver$key } from "./UserGreetingResolver.graphql";
import type { UserProfilePictureResolver$key } from "./UserProfilePictureResolver.graphql";
import type { FragmentType } from "relay-runtime";
import userGreetingResolver from "../UserGreetingResolver.js";
// Type assertion validating that `userGreetingResolver` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(userGreetingResolver: (
  rootKey: UserGreetingResolver$key, 
) => mixed);
import userUserProfilePictureUriWithScaleResolver from "../UserProfilePictureResolver.js";
// Type assertion validating that `userUserProfilePictureUriWithScaleResolver` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(userUserProfilePictureUriWithScaleResolver: (
  rootKey: UserProfilePictureResolver$key, 
  args: {|
    scale: ?number,
  |}, 
) => mixed);
declare export opaque type UserProfilePictureUriSuspendsWhenTheCounterIsOdd$fragmentType: FragmentType;
export type UserProfilePictureUriSuspendsWhenTheCounterIsOdd$data = {|
  +greeting: ?$Call<<R>((...empty[]) => R) => R, typeof userGreetingResolver>,
  +uri: ?$Call<<R>((...empty[]) => R) => R, typeof userUserProfilePictureUriWithScaleResolver>,
  +$fragmentType: UserProfilePictureUriSuspendsWhenTheCounterIsOdd$fragmentType,
|};
export type UserProfilePictureUriSuspendsWhenTheCounterIsOdd$key = {
  +$data?: UserProfilePictureUriSuspendsWhenTheCounterIsOdd$data,
  +$fragmentSpreads: UserProfilePictureUriSuspendsWhenTheCounterIsOdd$fragmentType,
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
  "name": "UserProfilePictureUriSuspendsWhenTheCounterIsOdd",
  "selections": [
    {
      "alias": null,
      "args": null,
      "fragment": {
        "args": null,
        "kind": "FragmentSpread",
        "name": "UserGreetingResolver"
      },
      "kind": "RelayResolver",
      "name": "greeting",
      "resolverModule": require('./../UserGreetingResolver'),
      "path": "greeting"
    },
    {
      "alias": "uri",
      "args": null,
      "fragment": {
        "args": [
          {
            "kind": "Variable",
            "name": "scale",
            "variableName": "scale"
          }
        ],
        "kind": "FragmentSpread",
        "name": "UserProfilePictureResolver"
      },
      "kind": "RelayResolver",
      "name": "user_profile_picture_uri_with_scale",
      "resolverModule": require('./../UserProfilePictureResolver'),
      "path": "uri"
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "ffbdc95f51d0e268ac8d325a890fcadb";
}

module.exports = ((node/*: any*/)/*: Fragment<
  UserProfilePictureUriSuspendsWhenTheCounterIsOdd$fragmentType,
  UserProfilePictureUriSuspendsWhenTheCounterIsOdd$data,
>*/);
