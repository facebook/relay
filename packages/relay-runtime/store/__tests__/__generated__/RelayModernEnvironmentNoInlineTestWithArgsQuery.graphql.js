/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<7aa9e3714a17fbf9f16fa7fe87f6341e>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayModernEnvironmentNoInlineTestWithArgs_noInline$fragmentType = any;
export type PhotoSize = "SMALL" | "LARGE" | "%future added value";
export type RelayModernEnvironmentNoInlineTestWithArgsQuery$variables = {|
  size?: ?$ReadOnlyArray<?number>,
  preset?: ?PhotoSize,
|};
export type RelayModernEnvironmentNoInlineTestWithArgsQueryVariables = RelayModernEnvironmentNoInlineTestWithArgsQuery$variables;
export type RelayModernEnvironmentNoInlineTestWithArgsQuery$data = {|
  +me: ?{|
    +$fragmentSpreads: RelayModernEnvironmentNoInlineTestWithArgs_noInline$fragmentType,
  |},
  +username: ?{|
    +$fragmentSpreads: RelayModernEnvironmentNoInlineTestWithArgs_noInline$fragmentType,
  |},
|};
export type RelayModernEnvironmentNoInlineTestWithArgsQueryResponse = RelayModernEnvironmentNoInlineTestWithArgsQuery$data;
export type RelayModernEnvironmentNoInlineTestWithArgsQuery = {|
  variables: RelayModernEnvironmentNoInlineTestWithArgsQueryVariables,
  response: RelayModernEnvironmentNoInlineTestWithArgsQuery$data,
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
},
v2 = [
  {
    "kind": "Literal",
    "name": "name",
    "value": "Zuck"
  }
],
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentNoInlineTestWithArgsQuery",
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
            "args": [
              {
                "kind": "Literal",
                "name": "cond",
                "value": true
              }
            ],
            "kind": "FragmentSpread",
            "name": "RelayModernEnvironmentNoInlineTestWithArgs_noInline"
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "username",
        "plural": false,
        "selections": [
          {
            "args": [
              {
                "kind": "Literal",
                "name": "cond",
                "value": false
              }
            ],
            "kind": "FragmentSpread",
            "name": "RelayModernEnvironmentNoInlineTestWithArgs_noInline"
          }
        ],
        "storageKey": "username(name:\"Zuck\")"
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
    "name": "RelayModernEnvironmentNoInlineTestWithArgsQuery",
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
                "args": [
                  {
                    "kind": "Literal",
                    "name": "RelayModernEnvironmentNoInlineTestWithArgs_noInline$cond",
                    "value": true
                  }
                ],
                "fragment": require('./RelayModernEnvironmentNoInlineTestWithArgs_noInline$normalization.graphql'),
                "kind": "FragmentSpread"
              }
            ],
            "type": "Actor",
            "abstractKey": "__isActor"
          },
          (v3/*: any*/)
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "username",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "__typename",
            "storageKey": null
          },
          {
            "kind": "TypeDiscriminator",
            "abstractKey": "__isActor"
          },
          {
            "args": [
              {
                "kind": "Literal",
                "name": "RelayModernEnvironmentNoInlineTestWithArgs_noInline$cond",
                "value": false
              }
            ],
            "fragment": require('./RelayModernEnvironmentNoInlineTestWithArgs_noInline$normalization.graphql'),
            "kind": "FragmentSpread"
          },
          (v3/*: any*/)
        ],
        "storageKey": "username(name:\"Zuck\")"
      }
    ]
  },
  "params": {
    "cacheID": "1418ce39d0cf4d91d0706c884f6bc91e",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentNoInlineTestWithArgsQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentNoInlineTestWithArgsQuery(\n  $size: [Int]\n  $preset: PhotoSize\n) {\n  me {\n    ...RelayModernEnvironmentNoInlineTestWithArgs_noInline_22eGLd\n    id\n  }\n  username(name: \"Zuck\") {\n    __typename\n    ...RelayModernEnvironmentNoInlineTestWithArgs_noInline_WrdK8\n    id\n  }\n}\n\nfragment RelayModernEnvironmentNoInlineTestWithArgs_noInline_22eGLd on Actor {\n  __isActor: __typename\n  ... on User {\n    profile_picture: profilePicture2(size: $size, preset: $preset, fileExtension: PNG) {\n      uri\n    }\n  }\n  ...RelayModernEnvironmentNoInlineTest_inner_4pWLrY\n}\n\nfragment RelayModernEnvironmentNoInlineTestWithArgs_noInline_WrdK8 on Actor {\n  __isActor: __typename\n  ... on User {\n    profile_picture: profilePicture2(size: $size, preset: $preset, fileExtension: PNG) {\n      uri\n    }\n  }\n}\n\nfragment RelayModernEnvironmentNoInlineTest_inner_4pWLrY on User {\n  profile_picture_inner: profilePicture2(size: $size, preset: $preset, fileExtension: JPG) {\n    uri\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "33033002af005dc1dfd32353c821dead";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentNoInlineTestWithArgsQuery$variables,
  RelayModernEnvironmentNoInlineTestWithArgsQuery$data,
>*/);
