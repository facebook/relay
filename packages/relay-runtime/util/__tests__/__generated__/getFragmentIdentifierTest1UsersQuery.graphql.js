/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<aa5cfec788e7e2496c776efdb12fb372>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { getFragmentIdentifierTest1UsersFragment$fragmentType } from "./getFragmentIdentifierTest1UsersFragment.graphql";
export type getFragmentIdentifierTest1UsersQuery$variables = {|
  ids: ReadonlyArray<string>,
  scale: number,
|};
export type getFragmentIdentifierTest1UsersQuery$data = {|
  +nodes: ?ReadonlyArray<?{|
    +$fragmentSpreads: getFragmentIdentifierTest1UsersFragment$fragmentType,
  |}>,
|};
export type getFragmentIdentifierTest1UsersQuery = {|
  response: getFragmentIdentifierTest1UsersQuery$data,
  variables: getFragmentIdentifierTest1UsersQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "ids"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "scale"
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
    "name": "getFragmentIdentifierTest1UsersQuery",
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
            "name": "getFragmentIdentifierTest1UsersFragment"
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
    "name": "getFragmentIdentifierTest1UsersQuery",
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
                "args": [
                  {
                    "kind": "Variable",
                    "name": "scale",
                    "variableName": "scale"
                  }
                ],
                "concreteType": "Image",
                "kind": "LinkedField",
                "name": "profile_picture",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "uri",
                    "storageKey": null
                  }
                ],
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
    "cacheID": "2b251b6133967089af3b56fc771d4fec",
    "id": null,
    "metadata": {},
    "name": "getFragmentIdentifierTest1UsersQuery",
    "operationKind": "query",
    "text": "query getFragmentIdentifierTest1UsersQuery(\n  $ids: [ID!]!\n  $scale: Float!\n) {\n  nodes(ids: $ids) {\n    __typename\n    ...getFragmentIdentifierTest1UsersFragment\n    id\n  }\n}\n\nfragment getFragmentIdentifierTest1NestedUserFragment on User {\n  username\n}\n\nfragment getFragmentIdentifierTest1UsersFragment on User {\n  id\n  name\n  profile_picture(scale: $scale) {\n    uri\n  }\n  ...getFragmentIdentifierTest1NestedUserFragment\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "fb0794ec3f00a33b50bc7c089587963e";
}

module.exports = ((node/*: any*/)/*: Query<
  getFragmentIdentifierTest1UsersQuery$variables,
  getFragmentIdentifierTest1UsersQuery$data,
>*/);
