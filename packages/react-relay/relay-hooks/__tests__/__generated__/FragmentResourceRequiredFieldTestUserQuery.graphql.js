/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<210e2d96d0e20787747f361efbcfb67f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { FragmentResourceRequiredFieldTestUserFragment$fragmentType } from "./FragmentResourceRequiredFieldTestUserFragment.graphql";
export type FragmentResourceRequiredFieldTestUserQuery$variables = {|
  id: string,
|};
export type FragmentResourceRequiredFieldTestUserQuery$data = {|
  +node: ?{|
    +__typename: string,
    +$fragmentSpreads: FragmentResourceRequiredFieldTestUserFragment$fragmentType,
  |},
|};
export type FragmentResourceRequiredFieldTestUserQuery = {|
  response: FragmentResourceRequiredFieldTestUserQuery$data,
  variables: FragmentResourceRequiredFieldTestUserQuery$variables,
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
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "FragmentResourceRequiredFieldTestUserQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "FragmentResourceRequiredFieldTestUserFragment"
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
    "name": "FragmentResourceRequiredFieldTestUserQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v2/*: any*/),
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
                "name": "alternate_name",
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
    "cacheID": "e13fb92ec772e55e612afa2d479f0bb7",
    "id": null,
    "metadata": {},
    "name": "FragmentResourceRequiredFieldTestUserQuery",
    "operationKind": "query",
    "text": "query FragmentResourceRequiredFieldTestUserQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...FragmentResourceRequiredFieldTestUserFragment\n    id\n  }\n}\n\nfragment FragmentResourceRequiredFieldTestUserFragment on User {\n  id\n  name\n  alternate_name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "4d73d93e8b781ced6ccafcf8d0b963e7";
}

module.exports = ((node/*: any*/)/*: Query<
  FragmentResourceRequiredFieldTestUserQuery$variables,
  FragmentResourceRequiredFieldTestUserQuery$data,
>*/);
