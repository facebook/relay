/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<d4e7375523616580dc954d801db5bb0d>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RefetchableClientEdgeQuery_RelayReaderRequiredFieldsTest28Query_live_user_resolver_always_suspend$fragmentType } from "./RefetchableClientEdgeQuery_RelayReaderRequiredFieldsTest28Query_live_user_resolver_always_suspend.graphql";
export type ClientEdgeQuery_RelayReaderRequiredFieldsTest28Query_live_user_resolver_always_suspend$variables = {|
  id: string,
|};
export type ClientEdgeQuery_RelayReaderRequiredFieldsTest28Query_live_user_resolver_always_suspend$data = {|
  +node: ?{|
    +$fragmentSpreads: RefetchableClientEdgeQuery_RelayReaderRequiredFieldsTest28Query_live_user_resolver_always_suspend$fragmentType,
  |},
|};
export type ClientEdgeQuery_RelayReaderRequiredFieldsTest28Query_live_user_resolver_always_suspend = {|
  response: ClientEdgeQuery_RelayReaderRequiredFieldsTest28Query_live_user_resolver_always_suspend$data,
  variables: ClientEdgeQuery_RelayReaderRequiredFieldsTest28Query_live_user_resolver_always_suspend$variables,
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
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ClientEdgeQuery_RelayReaderRequiredFieldsTest28Query_live_user_resolver_always_suspend",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "RefetchableClientEdgeQuery_RelayReaderRequiredFieldsTest28Query_live_user_resolver_always_suspend"
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ClientEdgeQuery_RelayReaderRequiredFieldsTest28Query_live_user_resolver_always_suspend",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
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
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
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
    ]
  },
  "params": {
    "cacheID": "6b4377983658f804a7b0a8e3be8b892c",
    "id": null,
    "metadata": {},
    "name": "ClientEdgeQuery_RelayReaderRequiredFieldsTest28Query_live_user_resolver_always_suspend",
    "operationKind": "query",
    "text": "query ClientEdgeQuery_RelayReaderRequiredFieldsTest28Query_live_user_resolver_always_suspend(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...RefetchableClientEdgeQuery_RelayReaderRequiredFieldsTest28Query_live_user_resolver_always_suspend\n    id\n  }\n}\n\nfragment RefetchableClientEdgeQuery_RelayReaderRequiredFieldsTest28Query_live_user_resolver_always_suspend on User {\n  name\n  id\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "1ea17c6315e8ba285db304130201310d";
}

module.exports = ((node/*: any*/)/*: Query<
  ClientEdgeQuery_RelayReaderRequiredFieldsTest28Query_live_user_resolver_always_suspend$variables,
  ClientEdgeQuery_RelayReaderRequiredFieldsTest28Query_live_user_resolver_always_suspend$data,
>*/);
