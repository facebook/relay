/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<d7966f247292044730f361903fff2fcc>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type readInlineDataTestQueryVariables$fragmentType = any;
export type readInlineDataTestQueryVariablesQuery$variables = {|
  scale?: ?number,
|};
export type readInlineDataTestQueryVariablesQuery$data = {|
  +me: ?{|
    +$fragmentSpreads: readInlineDataTestQueryVariables$fragmentType,
  |},
|};
export type readInlineDataTestQueryVariablesQuery = {|
  response: readInlineDataTestQueryVariablesQuery$data,
  variables: readInlineDataTestQueryVariablesQuery$variables,
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
v1 = {
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
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "readInlineDataTestQueryVariablesQuery",
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
            "name": "readInlineDataTestQueryVariables",
            "selections": [
              (v1/*: any*/)
            ],
            "args": null,
            "argumentDefinitions": [
              {
                "kind": "RootArgument",
                "name": "scale"
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
    "name": "readInlineDataTestQueryVariablesQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          (v1/*: any*/),
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
    "cacheID": "de7d0b3227e54afe664ea5817d1865e2",
    "id": null,
    "metadata": {},
    "name": "readInlineDataTestQueryVariablesQuery",
    "operationKind": "query",
    "text": "query readInlineDataTestQueryVariablesQuery(\n  $scale: Float\n) {\n  me {\n    ...readInlineDataTestQueryVariables\n    id\n  }\n}\n\nfragment readInlineDataTestQueryVariables on User {\n  profile_picture(scale: $scale) {\n    uri\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "b81371b5470d08403d2fc99426f4ab5f";
}

module.exports = ((node/*: any*/)/*: Query<
  readInlineDataTestQueryVariablesQuery$variables,
  readInlineDataTestQueryVariablesQuery$data,
>*/);
