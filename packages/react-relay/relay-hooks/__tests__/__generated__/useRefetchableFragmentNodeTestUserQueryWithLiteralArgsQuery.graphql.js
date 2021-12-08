/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<d4f8d9ca129d0616e8c45e85805b7187>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type useRefetchableFragmentNodeTestUserFragmentWithArgs$fragmentType = any;
export type useRefetchableFragmentNodeTestUserQueryWithLiteralArgsQuery$variables = {|
  id: string,
|};
export type useRefetchableFragmentNodeTestUserQueryWithLiteralArgsQueryVariables = useRefetchableFragmentNodeTestUserQueryWithLiteralArgsQuery$variables;
export type useRefetchableFragmentNodeTestUserQueryWithLiteralArgsQuery$data = {|
  +node: ?{|
    +$fragmentSpreads: useRefetchableFragmentNodeTestUserFragmentWithArgs$fragmentType,
  |},
|};
export type useRefetchableFragmentNodeTestUserQueryWithLiteralArgsQueryResponse = useRefetchableFragmentNodeTestUserQueryWithLiteralArgsQuery$data;
export type useRefetchableFragmentNodeTestUserQueryWithLiteralArgsQuery = {|
  variables: useRefetchableFragmentNodeTestUserQueryWithLiteralArgsQueryVariables,
  response: useRefetchableFragmentNodeTestUserQueryWithLiteralArgsQuery$data,
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
    "name": "useRefetchableFragmentNodeTestUserQueryWithLiteralArgsQuery",
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
            "args": [
              {
                "kind": "Literal",
                "name": "scaleLocal",
                "value": 16
              }
            ],
            "kind": "FragmentSpread",
            "name": "useRefetchableFragmentNodeTestUserFragmentWithArgs"
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
    "name": "useRefetchableFragmentNodeTestUserQueryWithLiteralArgsQuery",
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
                    "kind": "Literal",
                    "name": "scale",
                    "value": 16
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
                "storageKey": "profile_picture(scale:16)"
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
    "cacheID": "e51e371a0a4b15e9660ba738ec7f88cd",
    "id": null,
    "metadata": {},
    "name": "useRefetchableFragmentNodeTestUserQueryWithLiteralArgsQuery",
    "operationKind": "query",
    "text": "query useRefetchableFragmentNodeTestUserQueryWithLiteralArgsQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...useRefetchableFragmentNodeTestUserFragmentWithArgs_1L1tVy\n    id\n  }\n}\n\nfragment useRefetchableFragmentNodeTestNestedUserFragment on User {\n  username\n}\n\nfragment useRefetchableFragmentNodeTestUserFragmentWithArgs_1L1tVy on User {\n  id\n  name\n  profile_picture(scale: 16) {\n    uri\n  }\n  ...useRefetchableFragmentNodeTestNestedUserFragment\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "09f9c5bc18c5bfc0ded57db2a09602a9";
}

module.exports = ((node/*: any*/)/*: Query<
  useRefetchableFragmentNodeTestUserQueryWithLiteralArgsQuery$variables,
  useRefetchableFragmentNodeTestUserQueryWithLiteralArgsQuery$data,
>*/);
