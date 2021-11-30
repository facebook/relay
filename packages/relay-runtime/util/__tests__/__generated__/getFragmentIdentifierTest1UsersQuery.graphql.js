/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<b01380bdf0cbc563be652d576162d9df>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type getFragmentIdentifierTest1UsersFragment$fragmentType = any;
export type getFragmentIdentifierTest1UsersQuery$variables = {|
  ids: $ReadOnlyArray<string>,
  scale: number,
|};
export type getFragmentIdentifierTest1UsersQueryVariables = getFragmentIdentifierTest1UsersQuery$variables;
export type getFragmentIdentifierTest1UsersQuery$data = {|
  +nodes: ?$ReadOnlyArray<?{|
    +$fragmentSpreads: getFragmentIdentifierTest1UsersFragment$fragmentType,
  |}>,
|};
export type getFragmentIdentifierTest1UsersQueryResponse = getFragmentIdentifierTest1UsersQuery$data;
export type getFragmentIdentifierTest1UsersQuery = {|
  variables: getFragmentIdentifierTest1UsersQueryVariables,
  response: getFragmentIdentifierTest1UsersQuery$data,
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
