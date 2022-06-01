/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<5e42f9d1dc114aa7c9e640c0ecfed13d>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type readInlineDataTestFragmentAndQueryVariables$fragmentType = any;
export type readInlineDataTestFragmentAndQueryVariablesQuery$variables = {|
  scale1?: ?number,
  scale2?: ?number,
|};
export type readInlineDataTestFragmentAndQueryVariablesQuery$data = {|
  +me: ?{|
    +$fragmentSpreads: readInlineDataTestFragmentAndQueryVariables$fragmentType,
  |},
|};
export type readInlineDataTestFragmentAndQueryVariablesQuery = {|
  response: readInlineDataTestFragmentAndQueryVariablesQuery$data,
  variables: readInlineDataTestFragmentAndQueryVariablesQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "scale1"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "scale2"
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
],
v2 = {
  "alias": "queryVariable",
  "args": [
    {
      "kind": "Variable",
      "name": "scale",
      "variableName": "scale1"
    }
  ],
  "concreteType": "Image",
  "kind": "LinkedField",
  "name": "profile_picture",
  "plural": false,
  "selections": (v1/*: any*/),
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "readInlineDataTestFragmentAndQueryVariablesQuery",
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
            "name": "readInlineDataTestFragmentAndQueryVariables",
            "selections": [
              {
                "alias": "fragmentVariable",
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
              },
              (v2/*: any*/)
            ],
            "args": [
              {
                "kind": "Variable",
                "name": "theScale",
                "variableName": "scale2"
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
    "name": "readInlineDataTestFragmentAndQueryVariablesQuery",
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
            "alias": "fragmentVariable",
            "args": [
              {
                "kind": "Variable",
                "name": "scale",
                "variableName": "scale2"
              }
            ],
            "concreteType": "Image",
            "kind": "LinkedField",
            "name": "profile_picture",
            "plural": false,
            "selections": (v1/*: any*/),
            "storageKey": null
          },
          (v2/*: any*/),
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
    "cacheID": "de166188984c8269dbc8f89f35fb4a5b",
    "id": null,
    "metadata": {},
    "name": "readInlineDataTestFragmentAndQueryVariablesQuery",
    "operationKind": "query",
    "text": "query readInlineDataTestFragmentAndQueryVariablesQuery(\n  $scale1: Float\n  $scale2: Float\n) {\n  me {\n    ...readInlineDataTestFragmentAndQueryVariables_4vY5ns\n    id\n  }\n}\n\nfragment readInlineDataTestFragmentAndQueryVariables_4vY5ns on User {\n  fragmentVariable: profile_picture(scale: $scale2) {\n    uri\n  }\n  queryVariable: profile_picture(scale: $scale1) {\n    uri\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "4ec1512a8aec4bf5ece15aef3e46dc15";
}

module.exports = ((node/*: any*/)/*: Query<
  readInlineDataTestFragmentAndQueryVariablesQuery$variables,
  readInlineDataTestFragmentAndQueryVariablesQuery$data,
>*/);
