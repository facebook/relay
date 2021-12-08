/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<dfaec239148dea63a8f26a62045418c7>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type useFragmentTestUserFragment$fragmentType = any;
export type useFragmentTestUserQuery$variables = {|
  id: string,
|};
export type useFragmentTestUserQueryVariables = useFragmentTestUserQuery$variables;
export type useFragmentTestUserQuery$data = {|
  +node: ?{|
    +$fragmentSpreads: useFragmentTestUserFragment$fragmentType,
  |},
|};
export type useFragmentTestUserQueryResponse = useFragmentTestUserQuery$data;
export type useFragmentTestUserQuery = {|
  variables: useFragmentTestUserQueryVariables,
  response: useFragmentTestUserQuery$data,
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
    "name": "useFragmentTestUserQuery",
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
            "name": "useFragmentTestUserFragment"
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
    "name": "useFragmentTestUserQuery",
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
    "cacheID": "6014758bedd5587d7c8ab6a76decc270",
    "id": null,
    "metadata": {},
    "name": "useFragmentTestUserQuery",
    "operationKind": "query",
    "text": "query useFragmentTestUserQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...useFragmentTestUserFragment\n    id\n  }\n}\n\nfragment useFragmentTestNestedUserFragment on User {\n  username\n}\n\nfragment useFragmentTestUserFragment on User {\n  id\n  name\n  ...useFragmentTestNestedUserFragment\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "b7cb456d0fac348a436c061eb926e10b";
}

module.exports = ((node/*: any*/)/*: Query<
  useFragmentTestUserQuery$variables,
  useFragmentTestUserQuery$data,
>*/);
