/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<235c5114cf434e58b89746d516a0eae6>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { UserProfilePictureWithDefaultValueResolver$key } from "./../resolvers/__generated__/UserProfilePictureWithDefaultValueResolver.graphql";
import {user_profile_picture_uri_with_scale_and_default_value as userUserProfilePictureUriWithScaleAndDefaultValueResolverType} from "../resolvers/UserProfilePictureWithDefaultValueResolver.js";
import type { TestResolverContextType } from "../../../mutations/__tests__/TestResolverContextType";
// Type assertion validating that `userUserProfilePictureUriWithScaleAndDefaultValueResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(userUserProfilePictureUriWithScaleAndDefaultValueResolverType: (
  rootKey: UserProfilePictureWithDefaultValueResolver$key,
  args: {|
    scale: ?number,
  |},
  context: TestResolverContextType,
) => ?string);
export type RelayReaderResolverTest18Query$variables = {||};
export type RelayReaderResolverTest18Query$data = {|
  +me: ?{|
    +profile_picture2: ?string,
  |},
|};
export type RelayReaderResolverTest18Query = {|
  response: RelayReaderResolverTest18Query$data,
  variables: RelayReaderResolverTest18Query$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "scale",
    "value": 2
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderResolverTest18Query",
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
            "args": [],
            "fragment": {
              "args": (v0/*: any*/),
              "kind": "FragmentSpread",
              "name": "UserProfilePictureWithDefaultValueResolver"
            },
            "kind": "RelayResolver",
            "name": "user_profile_picture_uri_with_scale_and_default_value",
            "resolverModule": require('../resolvers/UserProfilePictureWithDefaultValueResolver').user_profile_picture_uri_with_scale_and_default_value,
            "path": "me.profile_picture2"
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
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayReaderResolverTest18Query",
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
            "name": "user_profile_picture_uri_with_scale_and_default_value",
            "args": null,
            "fragment": {
              "kind": "InlineFragment",
              "selections": [
                {
                  "alias": null,
                  "args": (v0/*: any*/),
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
                  "storageKey": "profile_picture(scale:2)"
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
    "cacheID": "514a1be0982f16d4e6ffa1ea5db98c6a",
    "id": null,
    "metadata": {},
    "name": "RelayReaderResolverTest18Query",
    "operationKind": "query",
    "text": "query RelayReaderResolverTest18Query {\n  me {\n    ...UserProfilePictureWithDefaultValueResolver_42I9Ds\n    id\n  }\n}\n\nfragment UserProfilePictureWithDefaultValueResolver_42I9Ds on User {\n  profile_picture(scale: 2) {\n    uri\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "45885a11a4ed3bfe287a950ff219df00";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderResolverTest18Query$variables,
  RelayReaderResolverTest18Query$data,
>*/);
