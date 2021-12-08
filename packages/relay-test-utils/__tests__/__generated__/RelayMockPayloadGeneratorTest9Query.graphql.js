/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<3ff77294ad7b183d61a71018b64d31a4>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayMockPayloadGeneratorTest9Fragment$fragmentType = any;
export type RelayMockPayloadGeneratorTest9Query$variables = {||};
export type RelayMockPayloadGeneratorTest9QueryVariables = RelayMockPayloadGeneratorTest9Query$variables;
export type RelayMockPayloadGeneratorTest9Query$data = {|
  +node: ?{|
    +$fragmentSpreads: RelayMockPayloadGeneratorTest9Fragment$fragmentType,
  |},
|};
export type RelayMockPayloadGeneratorTest9QueryResponse = RelayMockPayloadGeneratorTest9Query$data;
export type RelayMockPayloadGeneratorTest9Query = {|
  variables: RelayMockPayloadGeneratorTest9QueryVariables,
  response: RelayMockPayloadGeneratorTest9Query$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "my-id"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v2 = {
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
    "name": "RelayMockPayloadGeneratorTest9Query",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "RelayMockPayloadGeneratorTest9Fragment"
          }
        ],
        "storageKey": "node(id:\"my-id\")"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayMockPayloadGeneratorTest9Query",
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
                "concreteType": null,
                "kind": "LinkedField",
                "name": "actor",
                "plural": false,
                "selections": [
                  (v1/*: any*/),
                  (v2/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "name",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "type": "Page",
            "abstractKey": null
          },
          (v2/*: any*/)
        ],
        "storageKey": "node(id:\"my-id\")"
      }
    ]
  },
  "params": {
    "cacheID": "c2a3f7a88fd3144ba45ec8a274069605",
    "id": null,
    "metadata": {},
    "name": "RelayMockPayloadGeneratorTest9Query",
    "operationKind": "query",
    "text": "query RelayMockPayloadGeneratorTest9Query {\n  node(id: \"my-id\") {\n    __typename\n    ...RelayMockPayloadGeneratorTest9Fragment\n    id\n  }\n}\n\nfragment RelayMockPayloadGeneratorTest9Fragment on Page {\n  actor {\n    __typename\n    id\n    name\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "866407595a79b48f9ec7557156be487a";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayMockPayloadGeneratorTest9Query$variables,
  RelayMockPayloadGeneratorTest9Query$data,
>*/);
