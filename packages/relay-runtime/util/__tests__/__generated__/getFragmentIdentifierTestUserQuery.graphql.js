/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<6b81871b61d1ecd1fe1616014b685f30>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type getFragmentIdentifierTestUserFragment$fragmentType = any;
export type getFragmentIdentifierTestUserQuery$variables = {|
  id: string,
  scale: number,
|};
export type getFragmentIdentifierTestUserQueryVariables = getFragmentIdentifierTestUserQuery$variables;
export type getFragmentIdentifierTestUserQuery$data = {|
  +node: ?{|
    +$fragmentSpreads: getFragmentIdentifierTestUserFragment$fragmentType,
  |},
|};
export type getFragmentIdentifierTestUserQueryResponse = getFragmentIdentifierTestUserQuery$data;
export type getFragmentIdentifierTestUserQuery = {|
  variables: getFragmentIdentifierTestUserQueryVariables,
  response: getFragmentIdentifierTestUserQuery$data,
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
    "name": "getFragmentIdentifierTestUserQuery",
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
            "name": "getFragmentIdentifierTestUserFragment"
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
    "name": "getFragmentIdentifierTestUserQuery",
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
    "cacheID": "bd66b73206ef065eb81203e1b55f0594",
    "id": null,
    "metadata": {},
    "name": "getFragmentIdentifierTestUserQuery",
    "operationKind": "query",
    "text": "query getFragmentIdentifierTestUserQuery(\n  $id: ID!\n  $scale: Float!\n) {\n  node(id: $id) {\n    __typename\n    ...getFragmentIdentifierTestUserFragment\n    id\n  }\n}\n\nfragment getFragmentIdentifierTestNestedUserFragment on User {\n  username\n}\n\nfragment getFragmentIdentifierTestUserFragment on User {\n  id\n  name\n  profile_picture(scale: $scale) {\n    uri\n  }\n  ...getFragmentIdentifierTestNestedUserFragment\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "0109159e3a59848d6da59a0b19147157";
}

module.exports = ((node/*: any*/)/*: Query<
  getFragmentIdentifierTestUserQuery$variables,
  getFragmentIdentifierTestUserQuery$data,
>*/);
