/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<6a3d9cf13b537e4221ad17cbf86de1bb>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { useFragmentTestUsersFragment$fragmentType } from "./useFragmentTestUsersFragment.graphql";
export type useFragmentTestUsersQuery$variables = {|
  ids: ReadonlyArray<string>,
|};
export type useFragmentTestUsersQuery$data = {|
  +nodes: ?ReadonlyArray<?{|
    +$fragmentSpreads: useFragmentTestUsersFragment$fragmentType,
  |}>,
|};
export type useFragmentTestUsersQuery = {|
  response: useFragmentTestUsersQuery$data,
  variables: useFragmentTestUsersQuery$variables,
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
    "kind": "Variable",
    "name": "ids",
    "variableName": "ids"
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "useFragmentTestUsersQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "nodes",
        "plural": true,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "useFragmentTestUsersFragment"
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
    "name": "useFragmentTestUsersQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "nodes",
        "plural": true,
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
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "username",
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
    "cacheID": "44ff53c240453fc3efb6b7f33fc3185a",
    "id": null,
    "metadata": {},
    "name": "useFragmentTestUsersQuery",
    "operationKind": "query",
    "text": "query useFragmentTestUsersQuery(\n  $ids: [ID!]!\n) {\n  nodes(ids: $ids) {\n    __typename\n    ...useFragmentTestUsersFragment\n    id\n  }\n}\n\nfragment useFragmentTestNestedUserFragment on User {\n  username\n}\n\nfragment useFragmentTestUsersFragment on User {\n  id\n  name\n  ...useFragmentTestNestedUserFragment\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "52a64c5a6af260759a0739fc8faca4e1";
}

module.exports = ((node/*: any*/)/*: Query<
  useFragmentTestUsersQuery$variables,
  useFragmentTestUsersQuery$data,
>*/);
