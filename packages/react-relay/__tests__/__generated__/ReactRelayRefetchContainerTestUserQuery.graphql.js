/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<9d74102ead060bffe5301158295ddac2>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type ReactRelayRefetchContainerTestUserFragment$fragmentType = any;
export type ReactRelayRefetchContainerTestUserQuery$variables = {|
  id: string,
|};
export type ReactRelayRefetchContainerTestUserQueryVariables = ReactRelayRefetchContainerTestUserQuery$variables;
export type ReactRelayRefetchContainerTestUserQuery$data = {|
  +node: ?{|
    +$fragmentSpreads: ReactRelayRefetchContainerTestUserFragment$fragmentType,
  |},
|};
export type ReactRelayRefetchContainerTestUserQueryResponse = ReactRelayRefetchContainerTestUserQuery$data;
export type ReactRelayRefetchContainerTestUserQuery = {|
  variables: ReactRelayRefetchContainerTestUserQueryVariables,
  response: ReactRelayRefetchContainerTestUserQuery$data,
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
    "name": "ReactRelayRefetchContainerTestUserQuery",
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
            "name": "ReactRelayRefetchContainerTestUserFragment"
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
    "name": "ReactRelayRefetchContainerTestUserQuery",
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
    "cacheID": "1c6ad405cdaec9e84a9bb9fb9736a278",
    "id": null,
    "metadata": {},
    "name": "ReactRelayRefetchContainerTestUserQuery",
    "operationKind": "query",
    "text": "query ReactRelayRefetchContainerTestUserQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...ReactRelayRefetchContainerTestUserFragment\n    id\n  }\n}\n\nfragment ReactRelayRefetchContainerTestUserFragment on User {\n  id\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "699fa1e4a00f325e18b50aa63eb635f6";
}

module.exports = ((node/*: any*/)/*: Query<
  ReactRelayRefetchContainerTestUserQuery$variables,
  ReactRelayRefetchContainerTestUserQuery$data,
>*/);
