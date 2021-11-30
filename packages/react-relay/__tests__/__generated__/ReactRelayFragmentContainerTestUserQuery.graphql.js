/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<ce58c85099cc870e348313b9f5d3294a>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type ReactRelayFragmentContainerTestUserFragment$fragmentType = any;
export type ReactRelayFragmentContainerTestUserQuery$variables = {|
  id: string,
|};
export type ReactRelayFragmentContainerTestUserQueryVariables = ReactRelayFragmentContainerTestUserQuery$variables;
export type ReactRelayFragmentContainerTestUserQuery$data = {|
  +node: ?{|
    +$fragmentSpreads: ReactRelayFragmentContainerTestUserFragment$fragmentType,
  |},
|};
export type ReactRelayFragmentContainerTestUserQueryResponse = ReactRelayFragmentContainerTestUserQuery$data;
export type ReactRelayFragmentContainerTestUserQuery = {|
  variables: ReactRelayFragmentContainerTestUserQueryVariables,
  response: ReactRelayFragmentContainerTestUserQuery$data,
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
    "name": "ReactRelayFragmentContainerTestUserQuery",
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
            "name": "ReactRelayFragmentContainerTestUserFragment"
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
    "name": "ReactRelayFragmentContainerTestUserQuery",
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
    "cacheID": "92c494a2a3cadd4329c9438cc8bb9d05",
    "id": null,
    "metadata": {},
    "name": "ReactRelayFragmentContainerTestUserQuery",
    "operationKind": "query",
    "text": "query ReactRelayFragmentContainerTestUserQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...ReactRelayFragmentContainerTestUserFragment\n    id\n  }\n}\n\nfragment ReactRelayFragmentContainerTestUserFragment on User {\n  id\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "0e22a390b8b36d761b73909bcdbaf606";
}

module.exports = ((node/*: any*/)/*: Query<
  ReactRelayFragmentContainerTestUserQuery$variables,
  ReactRelayFragmentContainerTestUserQuery$data,
>*/);
