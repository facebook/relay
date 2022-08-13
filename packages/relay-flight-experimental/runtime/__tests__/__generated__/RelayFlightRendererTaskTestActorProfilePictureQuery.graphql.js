/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<1c0900d300856606a2c14657ee0901db>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayFlightRendererTaskTestActorProfilePictureQuery$variables = {||};
export type RelayFlightRendererTaskTestActorProfilePictureQuery$data = {|
  +viewer: ?{|
    +actor: ?{|
      +profile_picture?: ?{|
        +uri: ?string,
      |},
    |},
  |},
|};
export type RelayFlightRendererTaskTestActorProfilePictureQuery = {|
  response: RelayFlightRendererTaskTestActorProfilePictureQuery$data,
  variables: RelayFlightRendererTaskTestActorProfilePictureQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
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
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayFlightRendererTaskTestActorProfilePictureQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Viewer",
        "kind": "LinkedField",
        "name": "viewer",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "actor",
            "plural": false,
            "selections": [
              (v0/*: any*/)
            ],
            "storageKey": null
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
    "name": "RelayFlightRendererTaskTestActorProfilePictureQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Viewer",
        "kind": "LinkedField",
        "name": "viewer",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "actor",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "__typename",
                "storageKey": null
              },
              (v0/*: any*/),
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
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "9eb027111634573c34369fa76b4932ea",
    "id": null,
    "metadata": {},
    "name": "RelayFlightRendererTaskTestActorProfilePictureQuery",
    "operationKind": "query",
    "text": "query RelayFlightRendererTaskTestActorProfilePictureQuery {\n  viewer {\n    actor {\n      __typename\n      ... on User {\n        profile_picture {\n          uri\n        }\n      }\n      id\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "6b63ea648d695c93d1a1b95355c80fbd";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayFlightRendererTaskTestActorProfilePictureQuery$variables,
  RelayFlightRendererTaskTestActorProfilePictureQuery$data,
>*/);
