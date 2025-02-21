/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<13674f5f22576daad7c1bf3df650b42c>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { getFragmentIdentifierTest1UserFragmentWithArgs$fragmentType } from "./getFragmentIdentifierTest1UserFragmentWithArgs.graphql";
export type getFragmentIdentifierTest1UserQueryWithArgsQuery$variables = {|
  id: string,
  scale: number,
|};
export type getFragmentIdentifierTest1UserQueryWithArgsQuery$data = {|
  +node: ?{|
    +$fragmentSpreads: getFragmentIdentifierTest1UserFragmentWithArgs$fragmentType,
  |},
|};
export type getFragmentIdentifierTest1UserQueryWithArgsQuery = {|
  response: getFragmentIdentifierTest1UserQueryWithArgsQuery$data,
  variables: getFragmentIdentifierTest1UserQueryWithArgsQuery$variables,
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
    "name": "getFragmentIdentifierTest1UserQueryWithArgsQuery",
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
            "name": "getFragmentIdentifierTest1UserFragmentWithArgs"
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
    "name": "getFragmentIdentifierTest1UserQueryWithArgsQuery",
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
    "cacheID": "783934c56c8acd94a122f9bcb5dc03a5",
    "id": null,
    "metadata": {},
    "name": "getFragmentIdentifierTest1UserQueryWithArgsQuery",
    "operationKind": "query",
    "text": "query getFragmentIdentifierTest1UserQueryWithArgsQuery(\n  $id: ID!\n  $scale: Float!\n) {\n  node(id: $id) {\n    __typename\n    ...getFragmentIdentifierTest1UserFragmentWithArgs_3FMcZQ\n    id\n  }\n}\n\nfragment getFragmentIdentifierTest1NestedUserFragment on User {\n  username\n}\n\nfragment getFragmentIdentifierTest1UserFragmentWithArgs_3FMcZQ on User {\n  id\n  name\n  profile_picture(scale: $scale) {\n    uri\n  }\n  ...getFragmentIdentifierTest1NestedUserFragment\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "608b70474f7b066bac350843e1dd58c6";
}

module.exports = ((node/*: any*/)/*: Query<
  getFragmentIdentifierTest1UserQueryWithArgsQuery$variables,
  getFragmentIdentifierTest1UserQueryWithArgsQuery$data,
>*/);
