/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<25aea7751a908926dee43bf71f9aed93>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { readInlineDataTestFragmentVariables$fragmentType } from "./readInlineDataTestFragmentVariables.graphql";
export type readInlineDataTestFragmentVariablesQuery$variables = {|
  scale?: ?number,
|};
export type readInlineDataTestFragmentVariablesQuery$data = {|
  +me: ?{|
    +$fragmentSpreads: readInlineDataTestFragmentVariables$fragmentType,
  |},
|};
export type readInlineDataTestFragmentVariablesQuery = {|
  response: readInlineDataTestFragmentVariablesQuery$data,
  variables: readInlineDataTestFragmentVariablesQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "scale"
  }
],
v1 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "uri",
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "readInlineDataTestFragmentVariablesQuery",
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
            "kind": "InlineDataFragmentSpread",
            "name": "readInlineDataTestFragmentVariables",
            "selections": [
              {
                "alias": null,
                "args": [
                  {
                    "kind": "Variable",
                    "name": "scale",
                    "variableName": "theScale"
                  }
                ],
                "concreteType": "Image",
                "kind": "LinkedField",
                "name": "profile_picture",
                "plural": false,
                "selections": (v1/*: any*/),
                "storageKey": null
              }
            ],
            "args": [
              {
                "kind": "Variable",
                "name": "theScale",
                "variableName": "scale"
              }
            ],
            "argumentDefinitions": [
              {
                "defaultValue": null,
                "kind": "LocalArgument",
                "name": "theScale"
              }
            ]
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
    "name": "readInlineDataTestFragmentVariablesQuery",
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
            "selections": (v1/*: any*/),
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
    "cacheID": "596ef9f1116db8016778171f3c063d74",
    "id": null,
    "metadata": {},
    "name": "readInlineDataTestFragmentVariablesQuery",
    "operationKind": "query",
    "text": "query readInlineDataTestFragmentVariablesQuery(\n  $scale: Float\n) {\n  me {\n    ...readInlineDataTestFragmentVariables_qlgXP\n    id\n  }\n}\n\nfragment readInlineDataTestFragmentVariables_qlgXP on User {\n  profile_picture(scale: $scale) {\n    uri\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "cff614ecb857c3bd9cfc99f00f1e5471";
}

module.exports = ((node/*: any*/)/*: Query<
  readInlineDataTestFragmentVariablesQuery$variables,
  readInlineDataTestFragmentVariablesQuery$data,
>*/);
