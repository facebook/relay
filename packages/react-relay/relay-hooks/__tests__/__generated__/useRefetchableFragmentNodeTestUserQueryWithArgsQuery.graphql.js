/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<548108dff7e9225b8b568ac94f527ac2>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type useRefetchableFragmentNodeTestUserFragmentWithArgs$fragmentType = any;
export type useRefetchableFragmentNodeTestUserQueryWithArgsQuery$variables = {|
  id: string,
  scale: number,
|};
export type useRefetchableFragmentNodeTestUserQueryWithArgsQueryVariables = useRefetchableFragmentNodeTestUserQueryWithArgsQuery$variables;
export type useRefetchableFragmentNodeTestUserQueryWithArgsQuery$data = {|
  +node: ?{|
    +$fragmentSpreads: useRefetchableFragmentNodeTestUserFragmentWithArgs$fragmentType,
  |},
|};
export type useRefetchableFragmentNodeTestUserQueryWithArgsQueryResponse = useRefetchableFragmentNodeTestUserQueryWithArgsQuery$data;
export type useRefetchableFragmentNodeTestUserQueryWithArgsQuery = {|
  variables: useRefetchableFragmentNodeTestUserQueryWithArgsQueryVariables,
  response: useRefetchableFragmentNodeTestUserQueryWithArgsQuery$data,
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
    "name": "useRefetchableFragmentNodeTestUserQueryWithArgsQuery",
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
                "kind": "Variable",
                "name": "scaleLocal",
                "variableName": "scale"
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
    "name": "useRefetchableFragmentNodeTestUserQueryWithArgsQuery",
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
    "cacheID": "076b06ded4fb8062510f564341b2af97",
    "id": null,
    "metadata": {},
    "name": "useRefetchableFragmentNodeTestUserQueryWithArgsQuery",
    "operationKind": "query",
    "text": "query useRefetchableFragmentNodeTestUserQueryWithArgsQuery(\n  $id: ID!\n  $scale: Float!\n) {\n  node(id: $id) {\n    __typename\n    ...useRefetchableFragmentNodeTestUserFragmentWithArgs_3FMcZQ\n    id\n  }\n}\n\nfragment useRefetchableFragmentNodeTestNestedUserFragment on User {\n  username\n}\n\nfragment useRefetchableFragmentNodeTestUserFragmentWithArgs_3FMcZQ on User {\n  id\n  name\n  profile_picture(scale: $scale) {\n    uri\n  }\n  ...useRefetchableFragmentNodeTestNestedUserFragment\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "eb3a8dd67a24e472e2e18e80041d344a";
}

module.exports = ((node/*: any*/)/*: Query<
  useRefetchableFragmentNodeTestUserQueryWithArgsQuery$variables,
  useRefetchableFragmentNodeTestUserQueryWithArgsQuery$data,
>*/);
