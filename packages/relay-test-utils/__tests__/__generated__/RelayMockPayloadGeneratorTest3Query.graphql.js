/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<130b629349adc015304fe29c28ca5348>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayMockPayloadGeneratorTest2Fragment$fragmentType = any;
export type RelayMockPayloadGeneratorTest3Query$variables = {|
  condition: boolean,
|};
export type RelayMockPayloadGeneratorTest3QueryVariables = RelayMockPayloadGeneratorTest3Query$variables;
export type RelayMockPayloadGeneratorTest3Query$data = {|
  +node: ?{|
    +$fragmentSpreads: RelayMockPayloadGeneratorTest2Fragment$fragmentType,
  |},
|};
export type RelayMockPayloadGeneratorTest3QueryResponse = RelayMockPayloadGeneratorTest3Query$data;
export type RelayMockPayloadGeneratorTest3Query = {|
  variables: RelayMockPayloadGeneratorTest3QueryVariables,
  response: RelayMockPayloadGeneratorTest3Query$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "condition"
  }
],
v1 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "my-id"
  }
],
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
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayMockPayloadGeneratorTest3Query",
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
            "args": null,
            "kind": "FragmentSpread",
            "name": "RelayMockPayloadGeneratorTest2Fragment"
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RelayMockPayloadGeneratorTest3Query",
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
          (v2/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              (v3/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "User",
                "kind": "LinkedField",
                "name": "author",
                "plural": false,
                "selections": [
                  (v2/*: any*/),
                  (v3/*: any*/),
                  {
                    "alias": "authorID",
                    "args": null,
                    "kind": "ScalarField",
                    "name": "id",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "username",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "condition": "condition",
                "kind": "Condition",
                "passingValue": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "User",
                    "kind": "LinkedField",
                    "name": "author",
                    "plural": false,
                    "selections": [
                      {
                        "alias": "myId",
                        "args": null,
                        "kind": "ScalarField",
                        "name": "id",
                        "storageKey": null
                      },
                      {
                        "alias": "myUsername",
                        "args": null,
                        "kind": "ScalarField",
                        "name": "username",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "emailAddresses",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "Date",
                        "kind": "LinkedField",
                        "name": "birthdate",
                        "plural": false,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "day",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "month",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "year",
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ]
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
    "cacheID": "7b4112ccf5fd820c35c73aa9b6a4f3c8",
    "id": null,
    "metadata": {},
    "name": "RelayMockPayloadGeneratorTest3Query",
    "operationKind": "query",
    "text": "query RelayMockPayloadGeneratorTest3Query(\n  $condition: Boolean!\n) {\n  node(id: \"my-id\") {\n    __typename\n    ...RelayMockPayloadGeneratorTest2Fragment\n    id\n  }\n}\n\nfragment RelayMockPayloadGeneratorTest2Fragment on User {\n  id\n  name\n  author {\n    id\n    name\n    authorID: id\n    username\n  }\n  author @include(if: $condition) {\n    myId: id\n    myUsername: username\n    emailAddresses\n    birthdate {\n      day\n      month\n      year\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "02749249be24669737cad13a3b9b3559";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayMockPayloadGeneratorTest3Query$variables,
  RelayMockPayloadGeneratorTest3Query$data,
>*/);
