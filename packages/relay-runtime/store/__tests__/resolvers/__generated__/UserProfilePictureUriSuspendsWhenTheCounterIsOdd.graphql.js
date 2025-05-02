/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<6142d9f97247a1b158ca74abfe2c0fb9>>
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
import {greeting as userGreetingResolverType} from "../UserGreetingResolver.js";
import type { TestResolverContextType } from "../../../../mutations/__tests__/TestResolverContextType";
// Type assertion validating that `userGreetingResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(userGreetingResolverType: (
  rootKey: UserGreetingResolver$key,
  args: void,
  context: TestResolverContextType,
) => ?string);
import {user_profile_picture_uri_with_scale as userUserProfilePictureUriWithScaleResolverType} from "../UserProfilePictureResolver.js";
// Type assertion validating that `userUserProfilePictureUriWithScaleResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(userUserProfilePictureUriWithScaleResolverType: (
  rootKey: UserProfilePictureResolver$key,
  args: {|
    scale: ?number,
  |},
  context: TestResolverContextType,
) => ?string);
declare export opaque type UserProfilePictureUriSuspendsWhenTheCounterIsOdd$fragmentType: FragmentType;
export type UserProfilePictureUriSuspendsWhenTheCounterIsOdd$data = {|
  +greeting: ?string,
  +uri: ?string,
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
      "resolverModule": require('../UserGreetingResolver').greeting,
      "path": "greeting"
    },
    {
      "alias": "uri",
      "args": [],
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
      "resolverModule": require('../UserProfilePictureResolver').user_profile_picture_uri_with_scale,
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
