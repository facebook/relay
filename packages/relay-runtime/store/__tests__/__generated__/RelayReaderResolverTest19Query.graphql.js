/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<0c0f8368eca6c93115535f11529198c7>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type UserProfilePictureWithDefaultValueResolver$key = any;
import userUserProfilePictureUriWithScaleAndDefaultValueResolver from "../resolvers/UserProfilePictureWithDefaultValueResolver.js";
// Type assertion validating that `userUserProfilePictureUriWithScaleAndDefaultValueResolver` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(userUserProfilePictureUriWithScaleAndDefaultValueResolver: (
  rootKey: UserProfilePictureWithDefaultValueResolver$key, 
  args: {|
    scale: ?number,
  |}, 
) => mixed);
export type RelayReaderResolverTest19Query$variables = {|
  scale?: ?number,
|};
export type RelayReaderResolverTest19Query$data = {|
  +me: ?{|
    +big_profile_picture: ?{|
      +uri: ?string,
    |},
    +profile_picture2: ?$Call<<R>((...empty[]) => R) => R, typeof userUserProfilePictureUriWithScaleAndDefaultValueResolver>,
  |},
|};
export type RelayReaderResolverTest19Query = {|
  response: RelayReaderResolverTest19Query$data,
  variables: RelayReaderResolverTest19Query$variables,
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
    "kind": "Literal",
    "name": "scale",
    "value": 2
  }
],
v2 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "uri",
    "storageKey": null
  }
],
v3 = {
  "alias": "big_profile_picture",
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
  "selections": (v2/*: any*/),
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderResolverTest19Query",
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
            "alias": "profile_picture2",
            "args": null,
            "fragment": {
              "args": (v1/*: any*/),
              "kind": "FragmentSpread",
              "name": "UserProfilePictureWithDefaultValueResolver"
            },
            "kind": "RelayResolver",
            "name": "user_profile_picture_uri_with_scale_and_default_value",
            "resolverModule": require('./../resolvers/UserProfilePictureWithDefaultValueResolver.js'),
            "path": "me.profile_picture2"
          },
          (v3/*: any*/)
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
    "name": "RelayReaderResolverTest19Query",
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
            "alias": null,
            "args": (v1/*: any*/),
            "concreteType": "Image",
            "kind": "LinkedField",
            "name": "profile_picture",
            "plural": false,
            "selections": (v2/*: any*/),
            "storageKey": "profile_picture(scale:2)"
          },
          (v3/*: any*/),
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
    "cacheID": "a9eadb6d54c521a3382b882959829e51",
    "id": null,
    "metadata": {},
    "name": "RelayReaderResolverTest19Query",
    "operationKind": "query",
    "text": "query RelayReaderResolverTest19Query(\n  $scale: Float\n) {\n  me {\n    ...UserProfilePictureWithDefaultValueResolver_42I9Ds\n    big_profile_picture: profile_picture(scale: $scale) {\n      uri\n    }\n    id\n  }\n}\n\nfragment UserProfilePictureWithDefaultValueResolver_42I9Ds on User {\n  profile_picture(scale: 2) {\n    uri\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "093746388fb9fdb94eaeedff006ab715";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderResolverTest19Query$variables,
  RelayReaderResolverTest19Query$data,
>*/);
