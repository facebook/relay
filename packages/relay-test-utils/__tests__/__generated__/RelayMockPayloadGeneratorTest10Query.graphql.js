/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<556e906934c4faa599ade4a8b7c76157>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayMockPayloadGeneratorTest10Fragment$fragmentType = any;
export type RelayMockPayloadGeneratorTest10Query$variables = {||};
export type RelayMockPayloadGeneratorTest10QueryVariables = RelayMockPayloadGeneratorTest10Query$variables;
export type RelayMockPayloadGeneratorTest10Query$data = {|
  +node: ?{|
    +$fragmentSpreads: RelayMockPayloadGeneratorTest10Fragment$fragmentType,
  |},
|};
export type RelayMockPayloadGeneratorTest10QueryResponse = RelayMockPayloadGeneratorTest10Query$data;
export type RelayMockPayloadGeneratorTest10Query = {|
  variables: RelayMockPayloadGeneratorTest10QueryVariables,
  response: RelayMockPayloadGeneratorTest10Query$data,
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
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "uri",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayMockPayloadGeneratorTest10Query",
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
            "name": "RelayMockPayloadGeneratorTest10Fragment"
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
    "name": "RelayMockPayloadGeneratorTest10Query",
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
          (v2/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              (v3/*: any*/),
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
                    "kind": "InlineFragment",
                    "selections": [
                      (v3/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "Image",
                        "kind": "LinkedField",
                        "name": "profile_picture",
                        "plural": false,
                        "selections": [
                          (v4/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "height",
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      }
                    ],
                    "type": "User",
                    "abstractKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "Image",
                "kind": "LinkedField",
                "name": "profile_picture",
                "plural": false,
                "selections": [
                  (v4/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "type": "User",
            "abstractKey": null
          }
        ],
        "storageKey": "node(id:\"my-id\")"
      }
    ]
  },
  "params": {
    "cacheID": "4e24e55e9c2b265e644a3153b6d16628",
    "id": null,
    "metadata": {},
    "name": "RelayMockPayloadGeneratorTest10Query",
    "operationKind": "query",
    "text": "query RelayMockPayloadGeneratorTest10Query {\n  node(id: \"my-id\") {\n    __typename\n    ...RelayMockPayloadGeneratorTest10Fragment\n    id\n  }\n}\n\nfragment RelayMockPayloadGeneratorTest10Fragment on User {\n  name\n  actor {\n    __typename\n    ... on User {\n      id\n      name\n      profile_picture {\n        uri\n        height\n      }\n    }\n    id\n  }\n  profile_picture {\n    uri\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "1c2a05dc735392e60f599f20acecbd4f";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayMockPayloadGeneratorTest10Query$variables,
  RelayMockPayloadGeneratorTest10Query$data,
>*/);
