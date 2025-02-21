/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<bd5056361dfef316c705036aa1af6f58>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { FragmentResourceSemanticNonNullTestFragment1$fragmentType } from "./FragmentResourceSemanticNonNullTestFragment1.graphql";
import type { FragmentResourceSemanticNonNullTestFragment2$fragmentType } from "./FragmentResourceSemanticNonNullTestFragment2.graphql";
export type FragmentResourceSemanticNonNullTestQuery$variables = {|
  id: string,
|};
export type FragmentResourceSemanticNonNullTestQuery$data = {|
  +node: ?{|
    +__typename: string,
    +$fragmentSpreads: FragmentResourceSemanticNonNullTestFragment1$fragmentType & FragmentResourceSemanticNonNullTestFragment2$fragmentType,
  |},
|};
export type FragmentResourceSemanticNonNullTestQuery = {|
  response: FragmentResourceSemanticNonNullTestQuery$data,
  variables: FragmentResourceSemanticNonNullTestQuery$variables,
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
    "name": "FragmentResourceSemanticNonNullTestQuery",
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
            "name": "FragmentResourceSemanticNonNullTestFragment1"
          },
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "FragmentResourceSemanticNonNullTestFragment2"
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
    "name": "FragmentResourceSemanticNonNullTestQuery",
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
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "3214df14c7879c270b9f7eb23e7f9be5",
    "id": null,
    "metadata": {},
    "name": "FragmentResourceSemanticNonNullTestQuery",
    "operationKind": "query",
    "text": "query FragmentResourceSemanticNonNullTestQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...FragmentResourceSemanticNonNullTestFragment1\n    ...FragmentResourceSemanticNonNullTestFragment2\n    id\n  }\n}\n\nfragment FragmentResourceSemanticNonNullTestFragment1 on User {\n  name\n}\n\nfragment FragmentResourceSemanticNonNullTestFragment2 on User {\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "530d4a1ded82952de97544eaa016b219";
}

module.exports = ((node/*: any*/)/*: Query<
  FragmentResourceSemanticNonNullTestQuery$variables,
  FragmentResourceSemanticNonNullTestQuery$data,
>*/);
