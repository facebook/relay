/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<22feeb24a68ae2c337c86d887b1c14b6>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayFlightUseFragmentTestUserFragment$fragmentType } from "./RelayFlightUseFragmentTestUserFragment.graphql";
export type RelayFlightUseFragmentTestViewerQuery$variables = {||};
export type RelayFlightUseFragmentTestViewerQuery$data = {|
  +viewer: ?{|
    +actor: ?{|
      +$fragmentSpreads: RelayFlightUseFragmentTestUserFragment$fragmentType,
    |},
  |},
|};
export type RelayFlightUseFragmentTestViewerQuery = {|
  response: RelayFlightUseFragmentTestViewerQuery$data,
  variables: RelayFlightUseFragmentTestViewerQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayFlightUseFragmentTestViewerQuery",
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
                "args": null,
                "kind": "FragmentSpread",
                "name": "RelayFlightUseFragmentTestUserFragment"
              }
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
    "name": "RelayFlightUseFragmentTestViewerQuery",
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
              {
                "kind": "InlineFragment",
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "name",
                    "storageKey": null
                  }
                ],
                "type": "User",
                "abstractKey": null
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
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "ea9607a71e3f730009a26ccbc7c0ba55",
    "id": null,
    "metadata": {},
    "name": "RelayFlightUseFragmentTestViewerQuery",
    "operationKind": "query",
    "text": "query RelayFlightUseFragmentTestViewerQuery {\n  viewer {\n    actor {\n      __typename\n      ...RelayFlightUseFragmentTestUserFragment\n      id\n    }\n  }\n}\n\nfragment RelayFlightUseFragmentTestUserFragment on User {\n  name\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "59bb8df9e6386b5ef6761a827c983e38";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayFlightUseFragmentTestViewerQuery$variables,
  RelayFlightUseFragmentTestViewerQuery$data,
>*/);
