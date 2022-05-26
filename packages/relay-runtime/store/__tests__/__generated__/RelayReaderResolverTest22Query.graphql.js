/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<1e3356fa54e31c52da52932097d19477>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import userUserProfilePictureUriWithScaleAndAdditionalArgumentResolver from "../../../../relay-test-utils-internal/resolvers/UserProfilePictureWithRuntimeArgumentResolver.js";
export type RelayReaderResolverTest22Query$variables = {|
  name?: ?string,
  scale: number,
|};
export type RelayReaderResolverTest22Query$data = {|
  +me: ?{|
    +profile_picture: ?$Call<<R>((...empty[]) => R) => R, typeof userUserProfilePictureUriWithScaleAndAdditionalArgumentResolver>,
  |},
|};
export type RelayReaderResolverTest22Query = {|
  response: RelayReaderResolverTest22Query$data,
  variables: RelayReaderResolverTest22Query$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "name"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "scale"
},
v2 = [
  {
    "kind": "Variable",
    "name": "scale",
    "variableName": "scale"
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderResolverTest22Query",
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
            "args": [
              {
                "kind": "Variable",
                "name": "name",
                "variableName": "name"
              }
            ],
            "fragment": {
              "args": (v2/*: any*/),
              "kind": "FragmentSpread",
              "name": "UserProfilePictureWithRuntimeArgumentResolver"
            },
            "kind": "RelayResolver",
            "name": "user_profile_picture_uri_with_scale_and_additional_argument",
            "resolverModule": require('./../../../../relay-test-utils-internal/resolvers/UserProfilePictureWithRuntimeArgumentResolver.js'),
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
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "RelayReaderResolverTest22Query",
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
            "args": (v2/*: any*/),
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
    "cacheID": "b980508bdf1a199128185bdb5c1d4625",
    "id": null,
    "metadata": {},
    "name": "RelayReaderResolverTest22Query",
    "operationKind": "query",
    "text": "query RelayReaderResolverTest22Query(\n  $scale: Float!\n) {\n  me {\n    ...UserProfilePictureWithRuntimeArgumentResolver_Z91dU\n    id\n  }\n}\n\nfragment UserProfilePictureWithRuntimeArgumentResolver_Z91dU on User {\n  profile_picture(scale: $scale) {\n    uri\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "9d02165a03ceb10eb06f4ae4ad47f1b2";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderResolverTest22Query$variables,
  RelayReaderResolverTest22Query$data,
>*/);
