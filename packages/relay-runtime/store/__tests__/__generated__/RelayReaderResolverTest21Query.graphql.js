/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<4bd6e021a50e5a68f54574bf5244bdd8>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { UserProfilePictureResolver$key } from "./../resolvers/__generated__/UserProfilePictureResolver.graphql";
import {user_profile_picture_uri_with_scale as userUserProfilePictureUriWithScaleResolverType} from "../resolvers/UserProfilePictureResolver.js";
import type { TestResolverContextType } from "../../../mutations/__tests__/TestResolverContextType";
// Type assertion validating that `userUserProfilePictureUriWithScaleResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(userUserProfilePictureUriWithScaleResolverType: (
  rootKey: UserProfilePictureResolver$key,
  args: {|
    scale: ?number,
  |},
  context: TestResolverContextType,
) => ?string);
export type RelayReaderResolverTest21Query$variables = {|
  scale: number,
|};
export type RelayReaderResolverTest21Query$data = {|
  +me: ?{|
    +profile_picture: ?string,
  |},
|};
export type RelayReaderResolverTest21Query = {|
  response: RelayReaderResolverTest21Query$data,
  variables: RelayReaderResolverTest21Query$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "scale"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "scale",
    "variableName": "scale"
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderResolverTest21Query",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          {
            "alias": "profile_picture",
            "args": [],
            "fragment": {
              "args": (v1/*: any*/),
              "kind": "FragmentSpread",
              "name": "UserProfilePictureResolver"
            },
            "kind": "RelayResolver",
            "name": "user_profile_picture_uri_with_scale",
            "resolverModule": require('../resolvers/UserProfilePictureResolver').user_profile_picture_uri_with_scale,
            "path": "me.profile_picture"
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RelayReaderResolverTest21Query",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          {
            "name": "user_profile_picture_uri_with_scale",
            "args": null,
            "fragment": {
              "kind": "InlineFragment",
              "selections": [
                {
                  "alias": null,
                  "args": (v1/*: any*/),
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
            },
            "kind": "RelayResolver",
            "storageKey": null,
            "isOutputType": true
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "65e0ad0a83016615801b4e8f7464fae6",
    "id": null,
    "metadata": {},
    "name": "RelayReaderResolverTest21Query",
    "operationKind": "query",
    "text": "query RelayReaderResolverTest21Query(\n  $scale: Float!\n) {\n  me {\n    ...UserProfilePictureResolver_Z91dU\n    id\n  }\n}\n\nfragment UserProfilePictureResolver_Z91dU on User {\n  profile_picture(scale: $scale) {\n    uri\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "244ca7ba41fb3b6de0129e7170c17727";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderResolverTest21Query$variables,
  RelayReaderResolverTest21Query$data,
>*/);
