/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<e34bca0e561dd007ccaee8291a4f4e20>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @indirectDataDrivenDependency FragmentResourceWithOperationTrackerTestUserFragment.nameRenderer {"branches":{"MarkdownUserNameRenderer":{"component":"MarkdownUserNameRenderer.react","fragment":"FragmentResourceWithOperationTrackerTestMarkdownUserNameRenderer_name$normalization.graphql"},"PlainUserNameRenderer":{"component":"PlainUserNameRenderer.react","fragment":"FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name$normalization.graphql"}},"plural":false}
// @indirectDataDrivenDependency FragmentResourceWithOperationTrackerTestUserFragment.plainNameRenderer {"branches":{"PlainUserNameRenderer":{"component":"PlainUserNameRenderer.react","fragment":"FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name$normalization.graphql"}},"plural":false}

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { FragmentResourceWithOperationTrackerTestUserFragment$fragmentType } from "./FragmentResourceWithOperationTrackerTestUserFragment.graphql";
export type FragmentResourceWithOperationTrackerTestViewerFriendsQuery$variables = {||};
export type FragmentResourceWithOperationTrackerTestViewerFriendsQuery$data = {|
  +viewer: ?{|
    +actor: ?{|
      +friends: ?{|
        +edges: ?ReadonlyArray<?{|
          +node: ?{|
            +$fragmentSpreads: FragmentResourceWithOperationTrackerTestUserFragment$fragmentType,
          |},
        |}>,
      |},
    |},
  |},
|};
export type FragmentResourceWithOperationTrackerTestViewerFriendsQuery = {|
  response: FragmentResourceWithOperationTrackerTestViewerFriendsQuery$data,
  variables: FragmentResourceWithOperationTrackerTestViewerFriendsQuery$variables,
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
                                "value": "34hjiS"
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
                            "storageKey": "nameRenderer(supported:\"34hjiS\")"
                          },
                          {
                            "alias": "plainNameRenderer",
                            "args": [
                              {
                                "kind": "Literal",
                                "name": "supported",
                                "value": "1AwQS7"
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
                            "storageKey": "nameRenderer(supported:\"1AwQS7\")"
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
      ]
    },
    "name": "FragmentResourceWithOperationTrackerTestViewerFriendsQuery",
    "operationKind": "query",
    "text": "query FragmentResourceWithOperationTrackerTestViewerFriendsQuery {\n  viewer {\n    actor {\n      __typename\n      friends(first: 1) {\n        edges {\n          node {\n            ...FragmentResourceWithOperationTrackerTestUserFragment\n            id\n            __typename\n          }\n          cursor\n        }\n        pageInfo {\n          endCursor\n          hasNextPage\n        }\n      }\n      id\n    }\n  }\n}\n\nfragment FragmentResourceWithOperationTrackerTestMarkdownUserNameRenderer_name on MarkdownUserNameRenderer {\n  markdown\n  data {\n    markup\n    id\n  }\n}\n\nfragment FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name on PlainUserNameRenderer {\n  plaintext\n  data {\n    text\n    id\n  }\n}\n\nfragment FragmentResourceWithOperationTrackerTestUserFragment on User {\n  id\n  name\n  nameRenderer(supported: [\"PlainUserNameRenderer\", \"MarkdownUserNameRenderer\"]) {\n    __typename\n    ... on PlainUserNameRenderer {\n      ...FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name\n      __module_operation_FragmentResourceWithOperationTrackerTestUserFragment: js(module: \"FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name$normalization.graphql\", id: \"FragmentResourceWithOperationTrackerTestUserFragment.nameRenderer\")\n      __module_component_FragmentResourceWithOperationTrackerTestUserFragment: js(module: \"PlainUserNameRenderer.react\", id: \"FragmentResourceWithOperationTrackerTestUserFragment.nameRenderer\")\n    }\n    ... on MarkdownUserNameRenderer {\n      ...FragmentResourceWithOperationTrackerTestMarkdownUserNameRenderer_name\n      __module_operation_FragmentResourceWithOperationTrackerTestUserFragment: js(module: \"FragmentResourceWithOperationTrackerTestMarkdownUserNameRenderer_name$normalization.graphql\", id: \"FragmentResourceWithOperationTrackerTestUserFragment.nameRenderer\")\n      __module_component_FragmentResourceWithOperationTrackerTestUserFragment: js(module: \"MarkdownUserNameRenderer.react\", id: \"FragmentResourceWithOperationTrackerTestUserFragment.nameRenderer\")\n    }\n  }\n  plainNameRenderer: nameRenderer(supported: [\"PlainUserNameRenderer\"]) {\n    __typename\n    ... on PlainUserNameRenderer {\n      ...FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name\n      __module_operation_FragmentResourceWithOperationTrackerTestUserFragment_plainNameRenderer: js(module: \"FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name$normalization.graphql\", id: \"FragmentResourceWithOperationTrackerTestUserFragment.plainNameRenderer\")\n      __module_component_FragmentResourceWithOperationTrackerTestUserFragment_plainNameRenderer: js(module: \"PlainUserNameRenderer.react\", id: \"FragmentResourceWithOperationTrackerTestUserFragment.plainNameRenderer\")\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "9a6980a0f3a95258c3734cfb5f857974";
}

module.exports = ((node/*: any*/)/*: Query<
  FragmentResourceWithOperationTrackerTestViewerFriendsQuery$variables,
  FragmentResourceWithOperationTrackerTestViewerFriendsQuery$data,
>*/);
