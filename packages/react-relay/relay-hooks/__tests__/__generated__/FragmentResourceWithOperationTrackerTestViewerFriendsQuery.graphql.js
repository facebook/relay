/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<003e41e3a948f8339b6ae85775bd80a1>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type FragmentResourceWithOperationTrackerTestUserFragment$fragmentType = any;
export type FragmentResourceWithOperationTrackerTestViewerFriendsQuery$variables = {||};
export type FragmentResourceWithOperationTrackerTestViewerFriendsQueryVariables = FragmentResourceWithOperationTrackerTestViewerFriendsQuery$variables;
export type FragmentResourceWithOperationTrackerTestViewerFriendsQuery$data = {|
  +viewer: ?{|
    +actor: ?{|
      +friends: ?{|
        +edges: ?$ReadOnlyArray<?{|
          +node: ?{|
            +$fragmentSpreads: FragmentResourceWithOperationTrackerTestUserFragment$fragmentType,
          |},
        |}>,
      |},
    |},
  |},
|};
export type FragmentResourceWithOperationTrackerTestViewerFriendsQueryResponse = FragmentResourceWithOperationTrackerTestViewerFriendsQuery$data;
export type FragmentResourceWithOperationTrackerTestViewerFriendsQuery = {|
  variables: FragmentResourceWithOperationTrackerTestViewerFriendsQueryVariables,
  response: FragmentResourceWithOperationTrackerTestViewerFriendsQuery$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "cursor",
  "storageKey": null
},
v2 = {
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
v3 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 1
  }
],
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v5 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "String"
},
v6 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "String"
},
v7 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ID"
},
v8 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "UserNameRenderer"
},
v9 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "JSDependency"
},
v10 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "PlainUserNameData"
},
v11 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "ID"
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "FragmentResourceWithOperationTrackerTestViewerFriendsQuery",
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
                          (v0/*: any*/)
                        ],
                        "storageKey": null
                      },
                      (v1/*: any*/)
                    ],
                    "storageKey": null
                  },
                  (v2/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
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
    "name": "FragmentResourceWithOperationTrackerTestViewerFriendsQuery",
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
              (v0/*: any*/),
              {
                "alias": null,
                "args": (v3/*: any*/),
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
                          (v4/*: any*/),
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
                              (v0/*: any*/),
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
                              (v0/*: any*/),
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
                          (v0/*: any*/)
                        ],
                        "storageKey": null
                      },
                      (v1/*: any*/)
                    ],
                    "storageKey": null
                  },
                  (v2/*: any*/)
                ],
                "storageKey": "friends(first:1)"
              },
              {
                "alias": null,
                "args": (v3/*: any*/),
                "filters": null,
                "handle": "connection",
                "key": "Viewer_friends",
                "kind": "LinkedHandle",
                "name": "friends"
              },
              (v4/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "1e60d103b2cc4c925a326ba2410e5895",
    "id": null,
    "metadata": {
      "connection": [
        {
          "count": null,
          "cursor": null,
          "direction": "forward",
          "path": [
            "viewer",
            "actor",
            "friends"
          ]
        }
      ],
      "relayTestingSelectionTypeInfo": {
        "viewer": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Viewer"
        },
        "viewer.actor": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Actor"
        },
        "viewer.actor.__typename": (v5/*: any*/),
        "viewer.actor.friends": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "FriendsConnection"
        },
        "viewer.actor.friends.edges": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "FriendsEdge"
        },
        "viewer.actor.friends.edges.cursor": (v6/*: any*/),
        "viewer.actor.friends.edges.node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "User"
        },
        "viewer.actor.friends.edges.node.__typename": (v5/*: any*/),
        "viewer.actor.friends.edges.node.id": (v7/*: any*/),
        "viewer.actor.friends.edges.node.name": (v6/*: any*/),
        "viewer.actor.friends.edges.node.nameRenderer": (v8/*: any*/),
        "viewer.actor.friends.edges.node.nameRenderer.__module_component_FragmentResourceWithOperationTrackerTestUserFragment": (v9/*: any*/),
        "viewer.actor.friends.edges.node.nameRenderer.__module_operation_FragmentResourceWithOperationTrackerTestUserFragment": (v9/*: any*/),
        "viewer.actor.friends.edges.node.nameRenderer.__typename": (v5/*: any*/),
        "viewer.actor.friends.edges.node.nameRenderer.data": (v10/*: any*/),
        "viewer.actor.friends.edges.node.nameRenderer.data.id": (v11/*: any*/),
        "viewer.actor.friends.edges.node.nameRenderer.data.markup": (v6/*: any*/),
        "viewer.actor.friends.edges.node.nameRenderer.data.text": (v6/*: any*/),
        "viewer.actor.friends.edges.node.nameRenderer.markdown": (v6/*: any*/),
        "viewer.actor.friends.edges.node.nameRenderer.plaintext": (v6/*: any*/),
        "viewer.actor.friends.edges.node.plainNameRenderer": (v8/*: any*/),
        "viewer.actor.friends.edges.node.plainNameRenderer.__module_component_FragmentResourceWithOperationTrackerTestUserFragment_plainNameRenderer": (v9/*: any*/),
        "viewer.actor.friends.edges.node.plainNameRenderer.__module_operation_FragmentResourceWithOperationTrackerTestUserFragment_plainNameRenderer": (v9/*: any*/),
        "viewer.actor.friends.edges.node.plainNameRenderer.__typename": (v5/*: any*/),
        "viewer.actor.friends.edges.node.plainNameRenderer.data": (v10/*: any*/),
        "viewer.actor.friends.edges.node.plainNameRenderer.data.id": (v11/*: any*/),
        "viewer.actor.friends.edges.node.plainNameRenderer.data.text": (v6/*: any*/),
        "viewer.actor.friends.edges.node.plainNameRenderer.plaintext": (v6/*: any*/),
        "viewer.actor.friends.pageInfo": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "PageInfo"
        },
        "viewer.actor.friends.pageInfo.endCursor": (v6/*: any*/),
        "viewer.actor.friends.pageInfo.hasNextPage": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Boolean"
        },
        "viewer.actor.id": (v7/*: any*/)
      }
    },
    "name": "FragmentResourceWithOperationTrackerTestViewerFriendsQuery",
    "operationKind": "query",
    "text": "query FragmentResourceWithOperationTrackerTestViewerFriendsQuery {\n  viewer {\n    actor {\n      __typename\n      friends(first: 1) {\n        edges {\n          node {\n            ...FragmentResourceWithOperationTrackerTestUserFragment\n            id\n            __typename\n          }\n          cursor\n        }\n        pageInfo {\n          endCursor\n          hasNextPage\n        }\n      }\n      id\n    }\n  }\n}\n\nfragment FragmentResourceWithOperationTrackerTestMarkdownUserNameRenderer_name on MarkdownUserNameRenderer {\n  markdown\n  data {\n    markup\n    id\n  }\n}\n\nfragment FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name on PlainUserNameRenderer {\n  plaintext\n  data {\n    text\n    id\n  }\n}\n\nfragment FragmentResourceWithOperationTrackerTestUserFragment on User {\n  id\n  name\n  nameRenderer(supported: [\"PlainUserNameRenderer\", \"MarkdownUserNameRenderer\"]) {\n    __typename\n    ... on PlainUserNameRenderer {\n      ...FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name\n      __module_operation_FragmentResourceWithOperationTrackerTestUserFragment: js(module: \"FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name$normalization.graphql\", id: \"FragmentResourceWithOperationTrackerTestUserFragment.nameRenderer\")\n      __module_component_FragmentResourceWithOperationTrackerTestUserFragment: js(module: \"PlainUserNameRenderer.react\", id: \"FragmentResourceWithOperationTrackerTestUserFragment.nameRenderer\")\n    }\n    ... on MarkdownUserNameRenderer {\n      ...FragmentResourceWithOperationTrackerTestMarkdownUserNameRenderer_name\n      __module_operation_FragmentResourceWithOperationTrackerTestUserFragment: js(module: \"FragmentResourceWithOperationTrackerTestMarkdownUserNameRenderer_name$normalization.graphql\", id: \"FragmentResourceWithOperationTrackerTestUserFragment.nameRenderer\")\n      __module_component_FragmentResourceWithOperationTrackerTestUserFragment: js(module: \"MarkdownUserNameRenderer.react\", id: \"FragmentResourceWithOperationTrackerTestUserFragment.nameRenderer\")\n    }\n  }\n  plainNameRenderer: nameRenderer(supported: [\"PlainUserNameRenderer\"]) {\n    __typename\n    ... on PlainUserNameRenderer {\n      ...FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name\n      __module_operation_FragmentResourceWithOperationTrackerTestUserFragment_plainNameRenderer: js(module: \"FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name$normalization.graphql\", id: \"FragmentResourceWithOperationTrackerTestUserFragment.plainNameRenderer\")\n      __module_component_FragmentResourceWithOperationTrackerTestUserFragment_plainNameRenderer: js(module: \"PlainUserNameRenderer.react\", id: \"FragmentResourceWithOperationTrackerTestUserFragment.plainNameRenderer\")\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "f15f8921d77c61be7dc708d9e8c1f412";
}

module.exports = ((node/*: any*/)/*: Query<
  FragmentResourceWithOperationTrackerTestViewerFriendsQuery$variables,
  FragmentResourceWithOperationTrackerTestViewerFriendsQuery$data,
>*/);
