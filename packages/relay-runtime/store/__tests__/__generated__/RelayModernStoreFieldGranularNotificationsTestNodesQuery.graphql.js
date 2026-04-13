/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<7120b2c8f2bf6e1ae4b80cfc0fab30e3>>
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
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernStoreFieldGranularNotificationsTestNodesQuery",
    "selections": (v1/*:: as any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "RelayModernStoreFieldGranularNotificationsTestNodesQuery",
    "selections": (v1/*:: as any*/)
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
  (node/*:: as any*/).hash = "bb546b55fa120c643b44c131e6eb007e";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  RelayModernStoreFieldGranularNotificationsTestNodesQuery$variables,
  RelayModernStoreFieldGranularNotificationsTestNodesQuery$data,
>*/);
