/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<5c67cbaf80d76a8bac0bfcb8907e4393>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type getFragmentIdentifierTest1UserFragment$fragmentType = any;
export type getFragmentIdentifierTest1UserQuery$variables = {|
  id: string,
  scale: number,
|};
export type getFragmentIdentifierTest1UserQueryVariables = getFragmentIdentifierTest1UserQuery$variables;
export type getFragmentIdentifierTest1UserQuery$data = {|
  +node: ?{|
    +$fragmentSpreads: getFragmentIdentifierTest1UserFragment$fragmentType,
  |},
|};
export type getFragmentIdentifierTest1UserQueryResponse = getFragmentIdentifierTest1UserQuery$data;
export type getFragmentIdentifierTest1UserQuery = {|
  variables: getFragmentIdentifierTest1UserQueryVariables,
  response: getFragmentIdentifierTest1UserQuery$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
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
    "name": "id",
    "variableName": "id"
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "getFragmentIdentifierTest1UserQuery",
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
            "name": "getFragmentIdentifierTest1UserFragment"
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
    "name": "getFragmentIdentifierTest1UserQuery",
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
    "cacheID": "2e1517bbe8ada28c0b3383ad0835a2a1",
    "id": null,
    "metadata": {},
    "name": "getFragmentIdentifierTest1UserQuery",
    "operationKind": "query",
    "text": "query getFragmentIdentifierTest1UserQuery(\n  $id: ID!\n  $scale: Float!\n) {\n  node(id: $id) {\n    __typename\n    ...getFragmentIdentifierTest1UserFragment\n    id\n  }\n}\n\nfragment getFragmentIdentifierTest1NestedUserFragment on User {\n  username\n}\n\nfragment getFragmentIdentifierTest1UserFragment on User {\n  id\n  name\n  profile_picture(scale: $scale) {\n    uri\n  }\n  ...getFragmentIdentifierTest1NestedUserFragment\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "a6ebfafd3adccdfde2e43998af09c190";
}

module.exports = ((node/*: any*/)/*: Query<
  getFragmentIdentifierTest1UserQuery$variables,
  getFragmentIdentifierTest1UserQuery$data,
>*/);
