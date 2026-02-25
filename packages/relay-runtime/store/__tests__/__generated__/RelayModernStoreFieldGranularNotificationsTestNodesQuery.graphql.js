/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<e852e0739f7930769ef89644fb302755>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayModernStoreFieldGranularNotificationsTestNodesQuery$variables = {|
  ids: ReadonlyArray<string>,
|};
export type RelayModernStoreFieldGranularNotificationsTestNodesQuery$data = {|
  +nodes: ?ReadonlyArray<?({|
    +__typename: "User",
    +id: string,
    +name: ?string,
  |} | {|
    // This will never be '%other', but we need some
    // value in case none of the concrete values match.
    +__typename: "%other",
    +id: string,
  |})>,
|};
export type RelayModernStoreFieldGranularNotificationsTestNodesQuery = {|
  response: RelayModernStoreFieldGranularNotificationsTestNodesQuery$data,
  variables: RelayModernStoreFieldGranularNotificationsTestNodesQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "ids"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "ids",
        "variableName": "ids"
      }
    ],
    "concreteType": null,
    "kind": "LinkedField",
    "name": "nodes",
    "plural": true,
    "selections": [
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
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernStoreFieldGranularNotificationsTestNodesQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RelayModernStoreFieldGranularNotificationsTestNodesQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "c355d266b7d1839f998b595dfc532b33",
    "id": null,
    "metadata": {},
    "name": "RelayModernStoreFieldGranularNotificationsTestNodesQuery",
    "operationKind": "query",
    "text": "query RelayModernStoreFieldGranularNotificationsTestNodesQuery(\n  $ids: [ID!]!\n) {\n  nodes(ids: $ids) {\n    id\n    __typename\n    ... on User {\n      name\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "bb546b55fa120c643b44c131e6eb007e";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernStoreFieldGranularNotificationsTestNodesQuery$variables,
  RelayModernStoreFieldGranularNotificationsTestNodesQuery$data,
>*/);
