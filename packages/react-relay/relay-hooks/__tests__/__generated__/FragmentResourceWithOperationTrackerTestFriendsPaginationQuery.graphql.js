/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<9fc027c4c4e2fcd7781bd2fc9a77990d>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type FragmentResourceWithOperationTrackerTestUserFragment$fragmentType = any;
export type FragmentResourceWithOperationTrackerTestFriendsPaginationQuery$variables = {|
  id: string,
|};
export type FragmentResourceWithOperationTrackerTestFriendsPaginationQueryVariables = FragmentResourceWithOperationTrackerTestFriendsPaginationQuery$variables;
export type FragmentResourceWithOperationTrackerTestFriendsPaginationQuery$data = {|
  +node: ?{|
    +friends?: ?{|
      +edges: ?$ReadOnlyArray<?{|
        +node: ?{|
          +$fragmentSpreads: FragmentResourceWithOperationTrackerTestUserFragment$fragmentType,
        |},
      |}>,
    |},
  |},
|};
export type FragmentResourceWithOperationTrackerTestFriendsPaginationQueryResponse = FragmentResourceWithOperationTrackerTestFriendsPaginationQuery$data;
export type FragmentResourceWithOperationTrackerTestFriendsPaginationQuery = {|
  variables: FragmentResourceWithOperationTrackerTestFriendsPaginationQueryVariables,
  response: FragmentResourceWithOperationTrackerTestFriendsPaginationQuery$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
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
  "name": "cursor",
  "storageKey": null
},
v4 = {
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
},
v5 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 1
  }
],
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v7 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "String"
},
v8 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "String"
},
v9 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ID"
},
v10 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "UserNameRenderer"
},
v11 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "JSDependency"
},
v12 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "PlainUserNameData"
},
v13 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "ID"
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "FragmentResourceWithOperationTrackerTestFriendsPaginationQuery",
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
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": "friends",
                "args": null,
                "concreteType": "FriendsConnection",
                "kind": "LinkedField",
                "name": "__Viewer_friends_connection",
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
                          {
                            "args": null,
                            "kind": "FragmentSpread",
                            "name": "FragmentResourceWithOperationTrackerTestUserFragment"
                          },
                          (v2/*: any*/)
                        ],
                        "storageKey": null
                      },
                      (v3/*: any*/)
                    ],
                    "storageKey": null
                  },
                  (v4/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "type": "User",
            "abstractKey": null
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
    "name": "FragmentResourceWithOperationTrackerTestFriendsPaginationQuery",
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
          {
            "kind": "InlineFragment",
            "selections": [
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
                        "concreteType": "User",
                        "kind": "LinkedField",
                        "name": "node",
                        "plural": false,
                        "selections": [
                          (v6/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "name",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": [
                              {
                                "kind": "Literal",
                                "name": "supported",
                                "value": [
                                  "PlainUserNameRenderer",
                                  "MarkdownUserNameRenderer"
                                ]
                              }
                            ],
                            "concreteType": null,
                            "kind": "LinkedField",
                            "name": "nameRenderer",
                            "plural": false,
                            "selections": [
                              (v2/*: any*/),
                              {
                                "kind": "InlineFragment",
                                "selections": [
                                  {
                                    "args": null,
                                    "documentName": "FragmentResourceWithOperationTrackerTestUserFragment",
                                    "fragmentName": "FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name",
                                    "fragmentPropName": "name",
                                    "kind": "ModuleImport"
                                  }
                                ],
                                "type": "PlainUserNameRenderer",
                                "abstractKey": null
                              },
                              {
                                "kind": "InlineFragment",
                                "selections": [
                                  {
                                    "args": null,
                                    "documentName": "FragmentResourceWithOperationTrackerTestUserFragment",
                                    "fragmentName": "FragmentResourceWithOperationTrackerTestMarkdownUserNameRenderer_name",
                                    "fragmentPropName": "name",
                                    "kind": "ModuleImport"
                                  }
                                ],
                                "type": "MarkdownUserNameRenderer",
                                "abstractKey": null
                              }
                            ],
                            "storageKey": "nameRenderer(supported:[\"PlainUserNameRenderer\",\"MarkdownUserNameRenderer\"])"
                          },
                          {
                            "alias": "plainNameRenderer",
                            "args": [
                              {
                                "kind": "Literal",
                                "name": "supported",
                                "value": [
                                  "PlainUserNameRenderer"
                                ]
                              }
                            ],
                            "concreteType": null,
                            "kind": "LinkedField",
                            "name": "nameRenderer",
                            "plural": false,
                            "selections": [
                              (v2/*: any*/),
                              {
                                "kind": "InlineFragment",
                                "selections": [
                                  {
                                    "args": null,
                                    "documentName": "FragmentResourceWithOperationTrackerTestUserFragment_plainNameRenderer",
                                    "fragmentName": "FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name",
                                    "fragmentPropName": "name",
                                    "kind": "ModuleImport"
                                  }
                                ],
                                "type": "PlainUserNameRenderer",
                                "abstractKey": null
                              }
                            ],
                            "storageKey": "nameRenderer(supported:[\"PlainUserNameRenderer\"])"
                          },
                          (v2/*: any*/)
                        ],
                        "storageKey": null
                      },
                      (v3/*: any*/)
                    ],
                    "storageKey": null
                  },
                  (v4/*: any*/)
                ],
                "storageKey": "friends(first:1)"
              },
              {
                "alias": null,
                "args": (v5/*: any*/),
                "filters": null,
                "handle": "connection",
                "key": "Viewer_friends",
                "kind": "LinkedHandle",
                "name": "friends"
              }
            ],
            "type": "User",
            "abstractKey": null
          },
          (v6/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "f1b0a792f8ef220bfb3a510ba71d9e95",
    "id": null,
    "metadata": {
      "connection": [
        {
          "count": null,
          "cursor": null,
          "direction": "forward",
          "path": [
            "node",
            "friends"
          ]
        }
      ],
      "relayTestingSelectionTypeInfo": {
        "node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Node"
        },
        "node.__typename": (v7/*: any*/),
        "node.friends": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "FriendsConnection"
        },
        "node.friends.edges": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "FriendsEdge"
        },
        "node.friends.edges.cursor": (v8/*: any*/),
        "node.friends.edges.node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "User"
        },
        "node.friends.edges.node.__typename": (v7/*: any*/),
        "node.friends.edges.node.id": (v9/*: any*/),
        "node.friends.edges.node.name": (v8/*: any*/),
        "node.friends.edges.node.nameRenderer": (v10/*: any*/),
        "node.friends.edges.node.nameRenderer.__module_component_FragmentResourceWithOperationTrackerTestUserFragment": (v11/*: any*/),
        "node.friends.edges.node.nameRenderer.__module_operation_FragmentResourceWithOperationTrackerTestUserFragment": (v11/*: any*/),
        "node.friends.edges.node.nameRenderer.__typename": (v7/*: any*/),
        "node.friends.edges.node.nameRenderer.data": (v12/*: any*/),
        "node.friends.edges.node.nameRenderer.data.id": (v13/*: any*/),
        "node.friends.edges.node.nameRenderer.data.markup": (v8/*: any*/),
        "node.friends.edges.node.nameRenderer.data.text": (v8/*: any*/),
        "node.friends.edges.node.nameRenderer.markdown": (v8/*: any*/),
        "node.friends.edges.node.nameRenderer.plaintext": (v8/*: any*/),
        "node.friends.edges.node.plainNameRenderer": (v10/*: any*/),
        "node.friends.edges.node.plainNameRenderer.__module_component_FragmentResourceWithOperationTrackerTestUserFragment_plainNameRenderer": (v11/*: any*/),
        "node.friends.edges.node.plainNameRenderer.__module_operation_FragmentResourceWithOperationTrackerTestUserFragment_plainNameRenderer": (v11/*: any*/),
        "node.friends.edges.node.plainNameRenderer.__typename": (v7/*: any*/),
        "node.friends.edges.node.plainNameRenderer.data": (v12/*: any*/),
        "node.friends.edges.node.plainNameRenderer.data.id": (v13/*: any*/),
        "node.friends.edges.node.plainNameRenderer.data.text": (v8/*: any*/),
        "node.friends.edges.node.plainNameRenderer.plaintext": (v8/*: any*/),
        "node.friends.pageInfo": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "PageInfo"
        },
        "node.friends.pageInfo.endCursor": (v8/*: any*/),
        "node.friends.pageInfo.hasNextPage": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Boolean"
        },
        "node.id": (v9/*: any*/)
      }
    },
    "name": "FragmentResourceWithOperationTrackerTestFriendsPaginationQuery",
    "operationKind": "query",
    "text": "query FragmentResourceWithOperationTrackerTestFriendsPaginationQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ... on User {\n      friends(first: 1) {\n        edges {\n          node {\n            ...FragmentResourceWithOperationTrackerTestUserFragment\n            id\n            __typename\n          }\n          cursor\n        }\n        pageInfo {\n          endCursor\n          hasNextPage\n        }\n      }\n    }\n    id\n  }\n}\n\nfragment FragmentResourceWithOperationTrackerTestMarkdownUserNameRenderer_name on MarkdownUserNameRenderer {\n  markdown\n  data {\n    markup\n    id\n  }\n}\n\nfragment FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name on PlainUserNameRenderer {\n  plaintext\n  data {\n    text\n    id\n  }\n}\n\nfragment FragmentResourceWithOperationTrackerTestUserFragment on User {\n  id\n  name\n  nameRenderer(supported: [\"PlainUserNameRenderer\", \"MarkdownUserNameRenderer\"]) {\n    __typename\n    ... on PlainUserNameRenderer {\n      ...FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name\n      __module_operation_FragmentResourceWithOperationTrackerTestUserFragment: js(module: \"FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name$normalization.graphql\", id: \"FragmentResourceWithOperationTrackerTestUserFragment.nameRenderer\")\n      __module_component_FragmentResourceWithOperationTrackerTestUserFragment: js(module: \"PlainUserNameRenderer.react\", id: \"FragmentResourceWithOperationTrackerTestUserFragment.nameRenderer\")\n    }\n    ... on MarkdownUserNameRenderer {\n      ...FragmentResourceWithOperationTrackerTestMarkdownUserNameRenderer_name\n      __module_operation_FragmentResourceWithOperationTrackerTestUserFragment: js(module: \"FragmentResourceWithOperationTrackerTestMarkdownUserNameRenderer_name$normalization.graphql\", id: \"FragmentResourceWithOperationTrackerTestUserFragment.nameRenderer\")\n      __module_component_FragmentResourceWithOperationTrackerTestUserFragment: js(module: \"MarkdownUserNameRenderer.react\", id: \"FragmentResourceWithOperationTrackerTestUserFragment.nameRenderer\")\n    }\n  }\n  plainNameRenderer: nameRenderer(supported: [\"PlainUserNameRenderer\"]) {\n    __typename\n    ... on PlainUserNameRenderer {\n      ...FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name\n      __module_operation_FragmentResourceWithOperationTrackerTestUserFragment_plainNameRenderer: js(module: \"FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name$normalization.graphql\", id: \"FragmentResourceWithOperationTrackerTestUserFragment.plainNameRenderer\")\n      __module_component_FragmentResourceWithOperationTrackerTestUserFragment_plainNameRenderer: js(module: \"PlainUserNameRenderer.react\", id: \"FragmentResourceWithOperationTrackerTestUserFragment.plainNameRenderer\")\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "e5c44762a69061fbab95e22a6c65eba6";
}

module.exports = ((node/*: any*/)/*: Query<
  FragmentResourceWithOperationTrackerTestFriendsPaginationQuery$variables,
  FragmentResourceWithOperationTrackerTestFriendsPaginationQuery$data,
>*/);
