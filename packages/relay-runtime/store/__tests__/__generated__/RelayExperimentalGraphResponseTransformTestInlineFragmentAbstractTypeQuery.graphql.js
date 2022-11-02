/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<a47f584d8426a7253d04194f107d16fc>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayExperimentalGraphResponseTransformTestInlineFragmentAbstractTypeQuery$variables = {||};
export type RelayExperimentalGraphResponseTransformTestInlineFragmentAbstractTypeQuery$data = {|
  +node: ?{|
    +author?: ?{|
      +__typename: "User",
    |},
    +name?: ?string,
  |},
|};
export type RelayExperimentalGraphResponseTransformTestInlineFragmentAbstractTypeQuery = {|
  response: RelayExperimentalGraphResponseTransformTestInlineFragmentAbstractTypeQuery$data,
  variables: RelayExperimentalGraphResponseTransformTestInlineFragmentAbstractTypeQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "10"
  }
],
v1 = {
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
  "type": "Actor",
  "abstractKey": "__isActor"
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayExperimentalGraphResponseTransformTestInlineFragmentAbstractTypeQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v1/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "User",
                "kind": "LinkedField",
                "name": "author",
                "plural": false,
                "selections": [
                  (v2/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "type": "Comment",
            "abstractKey": null
          }
        ],
        "storageKey": "node(id:\"10\")"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayExperimentalGraphResponseTransformTestInlineFragmentAbstractTypeQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v1/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "User",
                "kind": "LinkedField",
                "name": "author",
                "plural": false,
                "selections": [
                  (v2/*: any*/),
                  (v3/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "type": "Comment",
            "abstractKey": null
          },
          (v3/*: any*/)
        ],
        "storageKey": "node(id:\"10\")"
      }
    ]
  },
  "params": {
    "cacheID": "2fe45f695c50e1d25020078586b74b8a",
    "id": null,
    "metadata": {},
    "name": "RelayExperimentalGraphResponseTransformTestInlineFragmentAbstractTypeQuery",
    "operationKind": "query",
    "text": "query RelayExperimentalGraphResponseTransformTestInlineFragmentAbstractTypeQuery {\n  node(id: \"10\") {\n    __typename\n    ... on Actor {\n      __isActor: __typename\n      name\n    }\n    ... on Comment {\n      author {\n        __typename\n        id\n      }\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "fcc4ced618c2fe637b1fdab45f33fd95";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayExperimentalGraphResponseTransformTestInlineFragmentAbstractTypeQuery$variables,
  RelayExperimentalGraphResponseTransformTestInlineFragmentAbstractTypeQuery$data,
>*/);
