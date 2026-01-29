/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<8cd3dc9de6099bff154fa4911de1a39c>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { getFragmentIdentifierTestUserFragmentWithArgs$fragmentType } from "./getFragmentIdentifierTestUserFragmentWithArgs.graphql";
export type getFragmentIdentifierTestUserQueryWithArgsQuery$variables = {|
  id: string,
  scale: number,
|};
export type getFragmentIdentifierTestUserQueryWithArgsQuery$data = {|
  +node: ?{|
    +$fragmentSpreads: getFragmentIdentifierTestUserFragmentWithArgs$fragmentType,
  |},
|};
export type getFragmentIdentifierTestUserQueryWithArgsQuery = {|
  response: getFragmentIdentifierTestUserQueryWithArgsQuery$data,
  variables: getFragmentIdentifierTestUserQueryWithArgsQuery$variables,
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
    "name": "getFragmentIdentifierTestUserQueryWithArgsQuery",
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
            "name": "getFragmentIdentifierTestUserFragmentWithArgs"
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
    "name": "getFragmentIdentifierTestUserQueryWithArgsQuery",
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
    "cacheID": "f62ac15a84e36afeaa26235a2b563308",
    "id": null,
    "metadata": {},
    "name": "getFragmentIdentifierTestUserQueryWithArgsQuery",
    "operationKind": "query",
    "text": "query getFragmentIdentifierTestUserQueryWithArgsQuery(\n  $id: ID!\n  $scale: Float!\n) {\n  node(id: $id) {\n    __typename\n    ...getFragmentIdentifierTestUserFragmentWithArgs_3FMcZQ\n    id\n  }\n}\n\nfragment getFragmentIdentifierTestNestedUserFragment on User {\n  username\n}\n\nfragment getFragmentIdentifierTestUserFragmentWithArgs_3FMcZQ on User {\n  id\n  name\n  profile_picture(scale: $scale) {\n    uri\n  }\n  ...getFragmentIdentifierTestNestedUserFragment\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "ce1c117df7e611604494cc0036258270";
}

module.exports = ((node/*: any*/)/*: Query<
  getFragmentIdentifierTestUserQueryWithArgsQuery$variables,
  getFragmentIdentifierTestUserQueryWithArgsQuery$data,
>*/);
