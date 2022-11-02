/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<9234ec1b5cead19377e59a83f3f063f5>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayModernEnvironmentTypeRefinementTest1Fragment$fragmentType } from "./RelayModernEnvironmentTypeRefinementTest1Fragment.graphql";
export type RelayModernEnvironmentTypeRefinementTest1Query$variables = {||};
export type RelayModernEnvironmentTypeRefinementTest1Query$data = {|
  +viewer: ?{|
    +actor: ?{|
      +$fragmentSpreads: RelayModernEnvironmentTypeRefinementTest1Fragment$fragmentType,
    |},
  |},
|};
export type RelayModernEnvironmentTypeRefinementTest1Query = {|
  response: RelayModernEnvironmentTypeRefinementTest1Query$data,
  variables: RelayModernEnvironmentTypeRefinementTest1Query$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentTypeRefinementTest1Query",
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
                "name": "RelayModernEnvironmentTypeRefinementTest1Fragment"
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
    "name": "RelayModernEnvironmentTypeRefinementTest1Query",
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
                "kind": "TypeDiscriminator",
                "abstractKey": "__isActor"
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "id",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "name",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "lastName",
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
    "cacheID": "1844e269946a0952eec1219f218515e7",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentTypeRefinementTest1Query",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentTypeRefinementTest1Query {\n  viewer {\n    actor {\n      __typename\n      ...RelayModernEnvironmentTypeRefinementTest1Fragment\n      id\n    }\n  }\n}\n\nfragment RelayModernEnvironmentTypeRefinementTest1Fragment on Actor {\n  __isActor: __typename\n  id\n  name\n  ...RelayModernEnvironmentTypeRefinementTest2Fragment\n}\n\nfragment RelayModernEnvironmentTypeRefinementTest2Fragment on Actor {\n  __isActor: __typename\n  lastName\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "0f830411ec71822a790dddf94b77c10d";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentTypeRefinementTest1Query$variables,
  RelayModernEnvironmentTypeRefinementTest1Query$data,
>*/);
