/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<b25f5a1fdacf336f7e083f6c77749df0>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayMockPayloadGeneratorTest_fragment61$fragmentType } from "./RelayMockPayloadGeneratorTest_fragment61.graphql";
export type RelayMockPayloadGeneratorTest60Query$variables = {|
  cond: boolean,
|};
export type RelayMockPayloadGeneratorTest60Query$data = {|
  +node: ?{|
    +$fragmentSpreads: RelayMockPayloadGeneratorTest_fragment61$fragmentType,
  |},
|};
export type RelayMockPayloadGeneratorTest60Query = {|
  response: RelayMockPayloadGeneratorTest60Query$data,
  variables: RelayMockPayloadGeneratorTest60Query$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "cond"
  }
],
v1 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "4"
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayMockPayloadGeneratorTest60Query",
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
            "args": [
              {
                "kind": "Variable",
                "name": "cond",
                "variableName": "cond"
              }
            ],
            "kind": "FragmentSpread",
            "name": "RelayMockPayloadGeneratorTest_fragment61"
          }
        ],
        "storageKey": "node(id:\"4\")"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RelayMockPayloadGeneratorTest60Query",
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
            "args": [
              {
                "kind": "Variable",
                "name": "RelayMockPayloadGeneratorTest_fragment61$cond",
                "variableName": "cond"
              }
            ],
            "fragment": require('./RelayMockPayloadGeneratorTest_fragment61$normalization.graphql'),
            "kind": "FragmentSpread"
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          }
        ],
        "storageKey": "node(id:\"4\")"
      }
    ]
  },
  "params": {
    "cacheID": "fea43ee9ba842a5f60a79b84f0bcb503",
    "id": null,
    "metadata": {},
    "name": "RelayMockPayloadGeneratorTest60Query",
    "operationKind": "query",
    "text": "query RelayMockPayloadGeneratorTest60Query(\n  $cond: Boolean!\n) {\n  node(id: \"4\") {\n    __typename\n    ...RelayMockPayloadGeneratorTest_fragment61_yuQoQ\n    id\n  }\n}\n\nfragment RelayMockPayloadGeneratorTest_fragment61_yuQoQ on User {\n  id\n  name @include(if: $cond)\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "3deee5972aa6d5f988a035cc01194d24";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayMockPayloadGeneratorTest60Query$variables,
  RelayMockPayloadGeneratorTest60Query$data,
>*/);
