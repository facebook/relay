/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<1b6ad22882cf3edf9157f7b5fc2612b7>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayModernEnvironmentBatchUpdatesTestFragment$fragmentType } from "./RelayModernEnvironmentBatchUpdatesTestFragment.graphql";
export type RelayModernEnvironmentBatchUpdatesTestQuery4$variables = {||};
export type RelayModernEnvironmentBatchUpdatesTestQuery4$data = {|
  +me: ?{|
    +$fragmentSpreads: RelayModernEnvironmentBatchUpdatesTestFragment$fragmentType,
  |},
|};
export type RelayModernEnvironmentBatchUpdatesTestQuery4 = {|
  response: RelayModernEnvironmentBatchUpdatesTestQuery4$data,
  variables: RelayModernEnvironmentBatchUpdatesTestQuery4$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentBatchUpdatesTestQuery4",
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
            "name": "RelayModernEnvironmentBatchUpdatesTestFragment"
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
    "name": "RelayModernEnvironmentBatchUpdatesTestQuery4",
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
    "cacheID": "313fca305dbf426de4012f280c3d3185",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentBatchUpdatesTestQuery4",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentBatchUpdatesTestQuery4 {\n  me {\n    ...RelayModernEnvironmentBatchUpdatesTestFragment\n    id\n  }\n}\n\nfragment RelayModernEnvironmentBatchUpdatesTestFragment on User {\n  name\n}\n"
  }
};

if (__DEV__) {
  (node/*:: as any*/).hash = "386c4f931f303bc715bfbeac551960eb";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  RelayModernEnvironmentBatchUpdatesTestQuery4$variables,
  RelayModernEnvironmentBatchUpdatesTestQuery4$data,
>*/);
