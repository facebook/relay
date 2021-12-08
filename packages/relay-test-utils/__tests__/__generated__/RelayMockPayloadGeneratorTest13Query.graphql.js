/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<5d423cc1c78632780d1a4ab606ac4bd6>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayMockPayloadGeneratorTest13Fragment$fragmentType = any;
export type RelayMockPayloadGeneratorTest13Query$variables = {||};
export type RelayMockPayloadGeneratorTest13QueryVariables = RelayMockPayloadGeneratorTest13Query$variables;
export type RelayMockPayloadGeneratorTest13Query$data = {|
  +viewer: ?{|
    +$fragmentSpreads: RelayMockPayloadGeneratorTest13Fragment$fragmentType,
  |},
|};
export type RelayMockPayloadGeneratorTest13QueryResponse = RelayMockPayloadGeneratorTest13Query$data;
export type RelayMockPayloadGeneratorTest13Query = {|
  variables: RelayMockPayloadGeneratorTest13QueryVariables,
  response: RelayMockPayloadGeneratorTest13Query$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayMockPayloadGeneratorTest13Query",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Viewer",
        "kind": "LinkedField",
        "name": "viewer",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "RelayMockPayloadGeneratorTest13Fragment"
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
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayMockPayloadGeneratorTest13Query",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Viewer",
        "kind": "LinkedField",
        "name": "viewer",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "actor",
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
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "id",
                "storageKey": null
              },
              {
                "kind": "InlineFragment",
                "selections": [
                  (v0/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "traits",
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
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "uri",
                        "storageKey": null
                      },
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
              },
              {
                "kind": "InlineFragment",
                "selections": [
                  (v0/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "websites",
                    "storageKey": null
                  }
                ],
                "type": "Page",
                "abstractKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "63be5a72a262e2e2203118c605b71cf8",
    "id": null,
    "metadata": {},
    "name": "RelayMockPayloadGeneratorTest13Query",
    "operationKind": "query",
    "text": "query RelayMockPayloadGeneratorTest13Query {\n  viewer {\n    ...RelayMockPayloadGeneratorTest13Fragment\n  }\n}\n\nfragment RelayMockPayloadGeneratorTest13Fragment on Viewer {\n  actor {\n    __typename\n    ... on User {\n      id\n      name\n      traits\n      profile_picture {\n        uri\n        height\n      }\n    }\n    ... on Page {\n      id\n      name\n      websites\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "5020131dfd6ff7b9b93eda26bdbedb49";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayMockPayloadGeneratorTest13Query$variables,
  RelayMockPayloadGeneratorTest13Query$data,
>*/);
