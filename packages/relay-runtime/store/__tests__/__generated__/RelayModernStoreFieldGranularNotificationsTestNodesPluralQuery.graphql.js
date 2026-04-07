/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<be263356756c5a6dd33f4ab18dc7b97c>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayModernStoreFieldGranularNotificationsTestNodesPluralQuery$variables = {|
  ids: ReadonlyArray<string>,
|};
export type RelayModernStoreFieldGranularNotificationsTestNodesPluralQuery$data = {|
  +nodes: ?ReadonlyArray<?{|
    +__typename: string,
    +id: string,
    +name?: ?string,
  |}>,
|};
export type RelayModernStoreFieldGranularNotificationsTestNodesPluralQuery = {|
  response: RelayModernStoreFieldGranularNotificationsTestNodesPluralQuery$data,
  variables: RelayModernStoreFieldGranularNotificationsTestNodesPluralQuery$variables,
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
    "name": "RelayModernStoreFieldGranularNotificationsTestNodesPluralQuery",
    "selections": (v1/*:: as any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "RelayModernStoreFieldGranularNotificationsTestNodesPluralQuery",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "d0c690d7fbe8783be5f4782e3d57f1c3",
    "id": null,
    "metadata": {},
    "name": "RelayModernStoreFieldGranularNotificationsTestNodesPluralQuery",
    "operationKind": "query",
    "text": "query RelayModernStoreFieldGranularNotificationsTestNodesPluralQuery(\n  $ids: [ID!]!\n) {\n  nodes(ids: $ids) {\n    id\n    __typename\n    ... on User {\n      name\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "eff0f7bda57b8b2a6e87fae0905ec755";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  RelayModernStoreFieldGranularNotificationsTestNodesPluralQuery$variables,
  RelayModernStoreFieldGranularNotificationsTestNodesPluralQuery$data,
>*/);
