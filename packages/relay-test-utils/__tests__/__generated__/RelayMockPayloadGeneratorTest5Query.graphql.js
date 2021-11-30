/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<8f534087d4dccea6c10e84f27841ff9d>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayMockPayloadGeneratorTest5Fragment$fragmentType = any;
export type RelayMockPayloadGeneratorTest5Query$variables = {|
  first?: ?number,
  skipUserInConnection: boolean,
|};
export type RelayMockPayloadGeneratorTest5QueryVariables = RelayMockPayloadGeneratorTest5Query$variables;
export type RelayMockPayloadGeneratorTest5Query$data = {|
  +node: ?{|
    +$fragmentSpreads: RelayMockPayloadGeneratorTest5Fragment$fragmentType,
  |},
|};
export type RelayMockPayloadGeneratorTest5QueryResponse = RelayMockPayloadGeneratorTest5Query$data;
export type RelayMockPayloadGeneratorTest5Query = {|
  variables: RelayMockPayloadGeneratorTest5QueryVariables,
  response: RelayMockPayloadGeneratorTest5Query$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "first"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "skipUserInConnection"
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
  "name": "__typename",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v5 = [
  {
    "kind": "Variable",
    "name": "first",
    "variableName": "first"
  }
],
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "username",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "emailAddresses",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayMockPayloadGeneratorTest5Query",
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
            "name": "RelayMockPayloadGeneratorTest5Fragment"
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
    "name": "RelayMockPayloadGeneratorTest5Query",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/),
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
                  (v2/*: any*/),
                  (v3/*: any*/),
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      {
                        "alias": "myType",
                        "args": null,
                        "kind": "ScalarField",
                        "name": "__typename",
                        "storageKey": null
                      },
                      {
                        "alias": "myName",
                        "args": null,
                        "kind": "ScalarField",
                        "name": "name",
                        "storageKey": null
                      },
                      (v4/*: any*/),
                      {
                        "alias": null,
                        "args": (v5/*: any*/),
                        "concreteType": "FriendsConnection",
                        "kind": "LinkedField",
                        "name": "friends",
                        "plural": false,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "FriendsEdge",
                            "kind": "LinkedField",
                            "name": "edges",
                            "plural": true,
                            "selections": [
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "cursor",
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "User",
                                "kind": "LinkedField",
                                "name": "node",
                                "plural": false,
                                "selections": [
                                  (v3/*: any*/),
                                  {
                                    "condition": "skipUserInConnection",
                                    "kind": "Condition",
                                    "passingValue": false,
                                    "selections": [
                                      (v4/*: any*/),
                                      (v6/*: any*/),
                                      (v7/*: any*/)
                                    ]
                                  },
                                  (v2/*: any*/)
                                ],
                                "storageKey": null
                              }
                            ],
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "PageInfo",
                            "kind": "LinkedField",
                            "name": "pageInfo",
                            "plural": false,
                            "selections": [
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "endCursor",
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "hasNextPage",
                                "storageKey": null
                              }
                            ],
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": (v5/*: any*/),
                        "filters": null,
                        "handle": "connection",
                        "key": "FriendsConnection_friends",
                        "kind": "LinkedHandle",
                        "name": "friends"
                      },
                      (v6/*: any*/),
                      (v7/*: any*/)
                    ],
                    "type": "User",
                    "abstractKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "type": "Page",
            "abstractKey": null
          }
        ],
        "storageKey": "node(id:\"my-id\")"
      }
    ]
  },
  "params": {
    "cacheID": "156934fb39e536bc929122cf6d9ec8c3",
    "id": null,
    "metadata": {},
    "name": "RelayMockPayloadGeneratorTest5Query",
    "operationKind": "query",
    "text": "query RelayMockPayloadGeneratorTest5Query(\n  $first: Int\n  $skipUserInConnection: Boolean!\n) {\n  node(id: \"my-id\") {\n    __typename\n    ...RelayMockPayloadGeneratorTest5Fragment\n    id\n  }\n}\n\nfragment RelayMockPayloadGeneratorTest4Fragment on User {\n  name\n  username\n  emailAddresses\n}\n\nfragment RelayMockPayloadGeneratorTest5Fragment on Page {\n  actor {\n    __typename\n    ... on User {\n      id\n      myType: __typename\n      myName: name\n      name\n      friends(first: $first) {\n        edges {\n          cursor\n          node {\n            id\n            ...RelayMockPayloadGeneratorTest4Fragment @skip(if: $skipUserInConnection)\n            __typename\n          }\n        }\n        pageInfo {\n          endCursor\n          hasNextPage\n        }\n      }\n      ...RelayMockPayloadGeneratorTest4Fragment\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "23c84e020a1563dfe94d3c227d810700";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayMockPayloadGeneratorTest5Query$variables,
  RelayMockPayloadGeneratorTest5Query$data,
>*/);
