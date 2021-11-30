/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<ab9fd0e3d1180a74525958825cc21490>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type getFragmentIdentifierTestUsersFragment$fragmentType = any;
export type getFragmentIdentifierTestUsersQuery$variables = {|
  ids: $ReadOnlyArray<string>,
  scale: number,
|};
export type getFragmentIdentifierTestUsersQueryVariables = getFragmentIdentifierTestUsersQuery$variables;
export type getFragmentIdentifierTestUsersQuery$data = {|
  +nodes: ?$ReadOnlyArray<?{|
    +$fragmentSpreads: getFragmentIdentifierTestUsersFragment$fragmentType,
  |}>,
|};
export type getFragmentIdentifierTestUsersQueryResponse = getFragmentIdentifierTestUsersQuery$data;
export type getFragmentIdentifierTestUsersQuery = {|
  variables: getFragmentIdentifierTestUsersQueryVariables,
  response: getFragmentIdentifierTestUsersQuery$data,
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
    "name": "getFragmentIdentifierTestUsersQuery",
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
            "name": "getFragmentIdentifierTestUsersFragment"
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
    "name": "getFragmentIdentifierTestUsersQuery",
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
    "cacheID": "8fc035d09663e0b054dbb225119cb445",
    "id": null,
    "metadata": {},
    "name": "getFragmentIdentifierTestUsersQuery",
    "operationKind": "query",
    "text": "query getFragmentIdentifierTestUsersQuery(\n  $ids: [ID!]!\n  $scale: Float!\n) {\n  nodes(ids: $ids) {\n    __typename\n    ...getFragmentIdentifierTestUsersFragment\n    id\n  }\n}\n\nfragment getFragmentIdentifierTestNestedUserFragment on User {\n  username\n}\n\nfragment getFragmentIdentifierTestUsersFragment on User {\n  id\n  name\n  profile_picture(scale: $scale) {\n    uri\n  }\n  ...getFragmentIdentifierTestNestedUserFragment\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "3df82ac7f8217191ca2160fb7fab8a1a";
}

module.exports = ((node/*: any*/)/*: Query<
  getFragmentIdentifierTestUsersQuery$variables,
  getFragmentIdentifierTestUsersQuery$data,
>*/);
