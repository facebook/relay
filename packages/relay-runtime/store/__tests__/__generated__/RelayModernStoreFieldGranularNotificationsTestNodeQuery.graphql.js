/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<a3e7e5a136984d829da1591f6e7110a0>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayModernStoreFieldGranularNotificationsTestNodeQuery$variables = {|
  id: string,
|};
export type RelayModernStoreFieldGranularNotificationsTestNodeQuery$data = {|
  +node: ?({|
    +__typename: "User",
    +id: string,
    +name: ?string,
  |} | {|
    // This will never be '%other', but we need some
    // value in case none of the concrete values match.
    +__typename: "%other",
  |}),
|};
export type RelayModernStoreFieldGranularNotificationsTestNodeQuery = {|
  response: RelayModernStoreFieldGranularNotificationsTestNodeQuery$data,
  variables: RelayModernStoreFieldGranularNotificationsTestNodeQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "id",
        "variableName": "id"
      }
    ],
    "concreteType": null,
    "kind": "LinkedField",
    "name": "node",
    "plural": false,
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
    "name": "RelayModernStoreFieldGranularNotificationsTestNodeQuery",
    "selections": (v1/*:: as any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "RelayModernStoreFieldGranularNotificationsTestNodeQuery",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "c02a849ecf611054cc599a96144b7b65",
    "id": null,
    "metadata": {},
    "name": "RelayModernStoreFieldGranularNotificationsTestNodeQuery",
    "operationKind": "query",
    "text": "query RelayModernStoreFieldGranularNotificationsTestNodeQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    id\n    __typename\n    ... on User {\n      name\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "112418d79e93dfd1afca1362c91bfe9d";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  RelayModernStoreFieldGranularNotificationsTestNodeQuery$variables,
  RelayModernStoreFieldGranularNotificationsTestNodeQuery$data,
>*/);
