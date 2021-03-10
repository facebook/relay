/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<f7c9b5b60d1fa01c03819c27ffae5c69>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
type useFragmentNodeRequiredTestUserFragment$ref = any;
export type useFragmentNodeRequiredTestUserQueryVariables = {|
  id: string,
|};
export type useFragmentNodeRequiredTestUserQueryResponse = {|
  +node: ?{|
    +$fragmentRefs: useFragmentNodeRequiredTestUserFragment$ref,
  |},
|};
export type useFragmentNodeRequiredTestUserQuery = {|
  variables: useFragmentNodeRequiredTestUserQueryVariables,
  response: useFragmentNodeRequiredTestUserQueryResponse,
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
    "name": "useFragmentNodeRequiredTestUserQuery",
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
            "name": "useFragmentNodeRequiredTestUserFragment"
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
    "name": "useFragmentNodeRequiredTestUserQuery",
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
    "cacheID": "95f790f566fab33fb922a9434cba3cec",
    "id": null,
    "metadata": {},
    "name": "useFragmentNodeRequiredTestUserQuery",
    "operationKind": "query",
    "text": "query useFragmentNodeRequiredTestUserQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...useFragmentNodeRequiredTestUserFragment\n    id\n  }\n}\n\nfragment useFragmentNodeRequiredTestUserFragment on User {\n  id\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "fc7ae7325babad6ab4c2fbda74adc09d";
}

module.exports = node;
