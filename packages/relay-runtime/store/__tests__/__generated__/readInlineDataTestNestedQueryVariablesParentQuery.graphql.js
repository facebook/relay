/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<0d0140472598f57bcb95951342fb4b2d>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { readInlineDataTestNestedQueryVariablesChild$fragmentType } from "./readInlineDataTestNestedQueryVariablesChild.graphql";
export type readInlineDataTestNestedQueryVariablesParentQuery$variables = {|
  scale?: ?number,
|};
export type readInlineDataTestNestedQueryVariablesParentQuery$data = {|
  +me: ?{|
    +$fragmentSpreads: readInlineDataTestNestedQueryVariablesChild$fragmentType,
  |},
|};
export type readInlineDataTestNestedQueryVariablesParentQuery = {|
  response: readInlineDataTestNestedQueryVariablesParentQuery$data,
  variables: readInlineDataTestNestedQueryVariablesParentQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "scale"
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "readInlineDataTestNestedQueryVariablesParentQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "readInlineDataTestNestedQueryVariablesChild"
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
    "name": "readInlineDataTestNestedQueryVariablesParentQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
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
            "name": "id",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "5830f2d5f3e9eac1d97ab9ebba2e6eb2",
    "id": null,
    "metadata": {},
    "name": "readInlineDataTestNestedQueryVariablesParentQuery",
    "operationKind": "query",
    "text": "query readInlineDataTestNestedQueryVariablesParentQuery(\n  $scale: Float\n) {\n  me {\n    ...readInlineDataTestNestedQueryVariablesChild\n    id\n  }\n}\n\nfragment readInlineDataTestNestedQueryVariablesChild on User {\n  ...readInlineDataTestNestedQueryVariablesGrandchild\n}\n\nfragment readInlineDataTestNestedQueryVariablesGrandchild on User {\n  profile_picture(scale: $scale) {\n    uri\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "0895903561ebff4372478d30aaad6430";
}

module.exports = ((node/*: any*/)/*: Query<
  readInlineDataTestNestedQueryVariablesParentQuery$variables,
  readInlineDataTestNestedQueryVariablesParentQuery$data,
>*/);
