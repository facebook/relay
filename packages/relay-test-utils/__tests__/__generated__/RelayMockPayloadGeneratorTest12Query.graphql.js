/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<b631f5e4d4d94d1c4fd066cfc9ba0280>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayMockPayloadGeneratorTest12Fragment$fragmentType = any;
export type RelayMockPayloadGeneratorTest12Query$variables = {||};
export type RelayMockPayloadGeneratorTest12QueryVariables = RelayMockPayloadGeneratorTest12Query$variables;
export type RelayMockPayloadGeneratorTest12Query$data = {|
  +node: ?{|
    +$fragmentSpreads: RelayMockPayloadGeneratorTest12Fragment$fragmentType,
  |},
|};
export type RelayMockPayloadGeneratorTest12QueryResponse = RelayMockPayloadGeneratorTest12Query$data;
export type RelayMockPayloadGeneratorTest12Query = {|
  variables: RelayMockPayloadGeneratorTest12QueryVariables,
  response: RelayMockPayloadGeneratorTest12Query$data,
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
  "name": "id",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v3 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "text",
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayMockPayloadGeneratorTest12Query",
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
            "name": "RelayMockPayloadGeneratorTest12Fragment"
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
    "name": "RelayMockPayloadGeneratorTest12Query",
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
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "__typename",
            "storageKey": null
          },
          (v1/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              (v2/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "Text",
                "kind": "LinkedField",
                "name": "body",
                "plural": false,
                "selections": (v3/*: any*/),
                "storageKey": null
              },
              {
                "alias": "myTown",
                "args": null,
                "concreteType": "Page",
                "kind": "LinkedField",
                "name": "hometown",
                "plural": false,
                "selections": [
                  (v1/*: any*/),
                  (v2/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "url",
                    "storageKey": null
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
                        "args": [
                          {
                            "kind": "Literal",
                            "name": "first",
                            "value": 10
                          }
                        ],
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
                                "kind": "ScalarField",
                                "name": "cursor",
                                "storageKey": null
                              },
                              {
                                "alias": "comment",
                                "args": null,
                                "concreteType": "Comment",
                                "kind": "LinkedField",
                                "name": "node",
                                "plural": false,
                                "selections": [
                                  (v1/*: any*/),
                                  {
                                    "alias": null,
                                    "args": null,
                                    "concreteType": "Text",
                                    "kind": "LinkedField",
                                    "name": "message",
                                    "plural": false,
                                    "selections": (v3/*: any*/),
                                    "storageKey": null
                                  },
                                  {
                                    "alias": null,
                                    "args": null,
                                    "concreteType": "Text",
                                    "kind": "LinkedField",
                                    "name": "likeSentence",
                                    "plural": false,
                                    "selections": (v3/*: any*/),
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
                                "name": "startCursor",
                                "storageKey": null
                              }
                            ],
                            "storageKey": null
                          }
                        ],
                        "storageKey": "comments(first:10)"
                      },
                      (v1/*: any*/)
                    ],
                    "storageKey": null
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
    "cacheID": "12a423e912cf611f7aa4bb6e38ece216",
    "id": null,
    "metadata": {},
    "name": "RelayMockPayloadGeneratorTest12Query",
    "operationKind": "query",
    "text": "query RelayMockPayloadGeneratorTest12Query {\n  node(id: \"my-id\") {\n    __typename\n    ...RelayMockPayloadGeneratorTest12Fragment\n    id\n  }\n}\n\nfragment RelayMockPayloadGeneratorTest12Fragment on Page {\n  id\n  name\n  body {\n    text\n  }\n  myTown: hometown {\n    id\n    name\n    url\n    feedback {\n      comments(first: 10) {\n        edges {\n          cursor\n          comment: node {\n            id\n            message {\n              text\n            }\n            likeSentence {\n              text\n            }\n          }\n        }\n        pageInfo {\n          startCursor\n        }\n      }\n      id\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "a1220185ee0ceb6d25b4cd775cdd7e36";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayMockPayloadGeneratorTest12Query$variables,
  RelayMockPayloadGeneratorTest12Query$data,
>*/);
