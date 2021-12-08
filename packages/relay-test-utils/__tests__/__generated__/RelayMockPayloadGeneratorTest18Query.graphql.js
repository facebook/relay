/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<80556da6593f9db9929081914741da32>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayMockPayloadGeneratorTest22Fragment$fragmentType = any;
export type PhotoSize = "SMALL" | "LARGE" | "%future added value";
export type RelayMockPayloadGeneratorTest18Query$variables = {|
  first?: ?number,
  picturePreset?: ?PhotoSize,
  RELAY_INCREMENTAL_DELIVERY?: ?boolean,
|};
export type RelayMockPayloadGeneratorTest18QueryVariables = RelayMockPayloadGeneratorTest18Query$variables;
export type RelayMockPayloadGeneratorTest18Query$data = {|
  +node: ?{|
    +$fragmentSpreads: RelayMockPayloadGeneratorTest22Fragment$fragmentType,
  |},
|};
export type RelayMockPayloadGeneratorTest18QueryResponse = RelayMockPayloadGeneratorTest18Query$data;
export type RelayMockPayloadGeneratorTest18Query = {|
  variables: RelayMockPayloadGeneratorTest18QueryVariables,
  response: RelayMockPayloadGeneratorTest18Query$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "defaultValue": false,
  "kind": "LocalArgument",
  "name": "RELAY_INCREMENTAL_DELIVERY"
},
v1 = {
  "defaultValue": 10,
  "kind": "LocalArgument",
  "name": "first"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "picturePreset"
},
v3 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "my-id"
  }
],
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v7 = [
  {
    "kind": "Variable",
    "name": "first",
    "variableName": "first"
  }
],
v8 = [
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
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "uri",
  "storageKey": null
},
v10 = [
  (v9/*: any*/)
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayMockPayloadGeneratorTest18Query",
    "selections": [
      {
        "alias": null,
        "args": (v3/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "args": [
              {
                "kind": "Literal",
                "name": "condition",
                "value": true
              }
            ],
            "kind": "FragmentSpread",
            "name": "RelayMockPayloadGeneratorTest22Fragment"
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
    "argumentDefinitions": [
      (v1/*: any*/),
      (v2/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "RelayMockPayloadGeneratorTest18Query",
    "selections": [
      {
        "alias": null,
        "args": (v3/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v4/*: any*/),
          (v5/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              (v6/*: any*/),
              {
                "alias": "myActor",
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "actor",
                "plural": false,
                "selections": [
                  (v4/*: any*/),
                  (v5/*: any*/),
                  (v6/*: any*/)
                ],
                "storageKey": null
              },
              {
                "alias": "customName",
                "args": null,
                "kind": "ScalarField",
                "name": "name",
                "storageKey": null
              },
              {
                "alias": null,
                "args": (v7/*: any*/),
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
                        "concreteType": "User",
                        "kind": "LinkedField",
                        "name": "node",
                        "plural": false,
                        "selections": [
                          (v5/*: any*/),
                          (v6/*: any*/),
                          (v4/*: any*/)
                        ],
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "cursor",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": "myPageInfo",
                    "args": null,
                    "concreteType": "PageInfo",
                    "kind": "LinkedField",
                    "name": "pageInfo",
                    "plural": false,
                    "selections": (v8/*: any*/),
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "PageInfo",
                    "kind": "LinkedField",
                    "name": "pageInfo",
                    "plural": false,
                    "selections": (v8/*: any*/),
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": (v7/*: any*/),
                "filters": null,
                "handle": "connection",
                "key": "User_friends",
                "kind": "LinkedHandle",
                "name": "friends"
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "Image",
                "kind": "LinkedField",
                "name": "profile_picture",
                "plural": false,
                "selections": (v10/*: any*/),
                "storageKey": null
              },
              {
                "alias": null,
                "args": [
                  {
                    "kind": "Variable",
                    "name": "preset",
                    "variableName": "picturePreset"
                  }
                ],
                "concreteType": "Image",
                "kind": "LinkedField",
                "name": "profilePicture",
                "plural": false,
                "selections": (v10/*: any*/),
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
                    "name": "month",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "actor",
                "plural": false,
                "selections": [
                  (v4/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "username",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "filters": null,
                    "handle": "MyUserName",
                    "key": "",
                    "kind": "ScalarHandle",
                    "name": "username"
                  },
                  (v5/*: any*/),
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      {
                        "alias": "userName",
                        "args": null,
                        "kind": "ScalarField",
                        "name": "name",
                        "storageKey": null
                      },
                      {
                        "alias": "name",
                        "args": null,
                        "kind": "ScalarField",
                        "name": "username",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": [
                          {
                            "kind": "Literal",
                            "name": "size",
                            "value": 1
                          }
                        ],
                        "concreteType": "Image",
                        "kind": "LinkedField",
                        "name": "profilePicture",
                        "plural": false,
                        "selections": [
                          (v9/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "width",
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
                        "storageKey": "profilePicture(size:1)"
                      },
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "Feedback",
                        "kind": "LinkedField",
                        "name": "feedback",
                        "plural": false,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "CommentsConnection",
                            "kind": "LinkedField",
                            "name": "comments",
                            "plural": false,
                            "selections": [
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "CommentsEdge",
                                "kind": "LinkedField",
                                "name": "edges",
                                "plural": true,
                                "selections": [
                                  {
                                    "alias": null,
                                    "args": null,
                                    "concreteType": "Comment",
                                    "kind": "LinkedField",
                                    "name": "node",
                                    "plural": false,
                                    "selections": [
                                      {
                                        "if": "RELAY_INCREMENTAL_DELIVERY",
                                        "kind": "Defer",
                                        "label": "RelayMockPayloadGeneratorTest22Fragment$defer$DeferLabel",
                                        "selections": [
                                          {
                                            "alias": null,
                                            "args": null,
                                            "concreteType": "Text",
                                            "kind": "LinkedField",
                                            "name": "body",
                                            "plural": false,
                                            "selections": [
                                              {
                                                "alias": null,
                                                "args": null,
                                                "kind": "ScalarField",
                                                "name": "text",
                                                "storageKey": null
                                              }
                                            ],
                                            "storageKey": null
                                          }
                                        ]
                                      },
                                      (v5/*: any*/)
                                    ],
                                    "storageKey": null
                                  }
                                ],
                                "storageKey": null
                              }
                            ],
                            "storageKey": null
                          },
                          (v5/*: any*/)
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
                      {
                        "alias": "pageName",
                        "args": null,
                        "kind": "ScalarField",
                        "name": "name",
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
            "type": "User",
            "abstractKey": null
          }
        ],
        "storageKey": "node(id:\"my-id\")"
      }
    ]
  },
  "params": {
    "cacheID": "9d0a38d5393b5080a663332dd0431bc8",
    "id": null,
    "metadata": {},
    "name": "RelayMockPayloadGeneratorTest18Query",
    "operationKind": "query",
    "text": "query RelayMockPayloadGeneratorTest18Query(\n  $first: Int = 10\n  $picturePreset: PhotoSize\n  $RELAY_INCREMENTAL_DELIVERY: Boolean = false\n) {\n  node(id: \"my-id\") {\n    __typename\n    ...RelayMockPayloadGeneratorTest22Fragment_1t4y1N\n    id\n  }\n}\n\nfragment RelayMockPayloadGeneratorTest21Fragment on User {\n  birthdate {\n    month\n  }\n}\n\nfragment RelayMockPayloadGeneratorTest22Fragment_1t4y1N on User {\n  id\n  name\n  myActor: actor {\n    __typename\n    id\n    name\n  }\n  customName: name\n  friends(first: $first) {\n    edges {\n      node {\n        id\n        name\n        __typename\n      }\n      cursor\n    }\n    myPageInfo: pageInfo {\n      endCursor\n      hasNextPage\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n  profile_picture {\n    uri\n  }\n  profilePicture(preset: $picturePreset) {\n    uri\n  }\n  ...RelayMockPayloadGeneratorTest21Fragment\n  actor {\n    __typename\n    ... on User {\n      id\n      userName: name\n      name: username\n      profilePicture(size: 1) {\n        uri\n        width\n        height\n      }\n      feedback {\n        comments {\n          edges {\n            node {\n              ...RelayMockPayloadGeneratorTest23Fragment @defer(label: \"RelayMockPayloadGeneratorTest22Fragment$defer$DeferLabel\", if: $RELAY_INCREMENTAL_DELIVERY)\n              id\n            }\n          }\n        }\n        id\n      }\n    }\n    ... on Page {\n      id\n      pageName: name\n    }\n    username\n    id\n  }\n}\n\nfragment RelayMockPayloadGeneratorTest23Fragment on Comment {\n  body {\n    text\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "b3b221c6cd5d517678c590d0bf6a22ee";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayMockPayloadGeneratorTest18Query$variables,
  RelayMockPayloadGeneratorTest18Query$data,
>*/);
