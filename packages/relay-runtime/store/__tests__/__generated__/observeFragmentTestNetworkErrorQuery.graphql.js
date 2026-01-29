/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<bd67d422ffd9395e08048e1b358a9c4d>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { observeFragmentTestNetworkErrorFragment$fragmentType } from "./observeFragmentTestNetworkErrorFragment.graphql";
export type observeFragmentTestNetworkErrorQuery$variables = {||};
export type observeFragmentTestNetworkErrorQuery$data = {|
  +$fragmentSpreads: observeFragmentTestNetworkErrorFragment$fragmentType,
|};
export type observeFragmentTestNetworkErrorQuery = {|
  response: observeFragmentTestNetworkErrorQuery$data,
  variables: observeFragmentTestNetworkErrorQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "observeFragmentTestNetworkErrorQuery",
    "selections": [
      {
        "args": null,
        "kind": "FragmentSpread",
        "name": "observeFragmentTestNetworkErrorFragment"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "observeFragmentTestNetworkErrorQuery",
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
            "args": null,
            "kind": "ScalarField",
            "name": "name",
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
    "cacheID": "ea59f42835e1af47e66fc74d78ea34fb",
    "id": null,
    "metadata": {},
    "name": "observeFragmentTestNetworkErrorQuery",
    "operationKind": "query",
    "text": "query observeFragmentTestNetworkErrorQuery {\n  ...observeFragmentTestNetworkErrorFragment\n}\n\nfragment observeFragmentTestNetworkErrorFragment on Query {\n  me {\n    name\n    id\n  }\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "ab0f402fbc738d3f90847297471bd4b3";
}

module.exports = ((node/*: any*/)/*: Query<
  observeFragmentTestNetworkErrorQuery$variables,
  observeFragmentTestNetworkErrorQuery$data,
>*/);
