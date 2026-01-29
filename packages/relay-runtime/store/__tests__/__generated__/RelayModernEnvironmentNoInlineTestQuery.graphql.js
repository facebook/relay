/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<787778e774f70f3225583de8c7efe124>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayModernEnvironmentNoInlineTest_noInline$fragmentType } from "./RelayModernEnvironmentNoInlineTest_noInline.graphql";
export type PhotoSize = "LARGE" | "SMALL" | "%future added value";
export type RelayModernEnvironmentNoInlineTestQuery$variables = {|
  preset?: ?PhotoSize,
  size?: ?ReadonlyArray<?number>,
|};
export type RelayModernEnvironmentNoInlineTestQuery$data = {|
  +me: ?{|
    +$fragmentSpreads: RelayModernEnvironmentNoInlineTest_noInline$fragmentType,
  |},
|};
export type RelayModernEnvironmentNoInlineTestQuery = {|
  response: RelayModernEnvironmentNoInlineTestQuery$data,
  variables: RelayModernEnvironmentNoInlineTestQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "preset"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "size"
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentNoInlineTestQuery",
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
            "args": null,
            "kind": "FragmentSpread",
            "name": "RelayModernEnvironmentNoInlineTest_noInline"
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
    "name": "RelayModernEnvironmentNoInlineTestQuery",
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
            "kind": "InlineFragment",
            "selections": [
              {
                "args": null,
                "fragment": require('./RelayModernEnvironmentNoInlineTest_noInline$normalization.graphql'),
                "kind": "FragmentSpread"
              }
            ],
            "type": "Actor",
            "abstractKey": "__isActor"
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
    "cacheID": "80696aa4b7becf5b469ef43ca7d9bf20",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentNoInlineTestQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentNoInlineTestQuery(\n  $size: [Int]\n  $preset: PhotoSize\n) {\n  me {\n    ...RelayModernEnvironmentNoInlineTest_noInline\n    id\n  }\n}\n\nfragment RelayModernEnvironmentNoInlineTest_inner_4pWLrY on User {\n  profile_picture_inner: profilePicture2(size: $size, preset: $preset, fileExtension: JPG) {\n    uri\n  }\n}\n\nfragment RelayModernEnvironmentNoInlineTest_noInline on Actor {\n  __isActor: __typename\n  ... on User {\n    profile_picture: profilePicture2(size: $size, preset: $preset, fileExtension: PNG) {\n      uri\n    }\n  }\n  ...RelayModernEnvironmentNoInlineTest_inner_4pWLrY\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "3a7cd297670bd45aeb18f860defe23bc";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentNoInlineTestQuery$variables,
  RelayModernEnvironmentNoInlineTestQuery$data,
>*/);
