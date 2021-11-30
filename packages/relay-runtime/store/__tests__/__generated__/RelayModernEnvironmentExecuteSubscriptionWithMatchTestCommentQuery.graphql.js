/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<6511eb4d548b4f897fd1b2e3b6033ec4>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayModernEnvironmentExecuteSubscriptionWithMatchTestCommentFragment$fragmentType = any;
export type RelayModernEnvironmentExecuteSubscriptionWithMatchTestCommentQuery$variables = {|
  id: string,
|};
export type RelayModernEnvironmentExecuteSubscriptionWithMatchTestCommentQueryVariables = RelayModernEnvironmentExecuteSubscriptionWithMatchTestCommentQuery$variables;
export type RelayModernEnvironmentExecuteSubscriptionWithMatchTestCommentQuery$data = {|
  +node: ?{|
    +id: string,
    +$fragmentSpreads: RelayModernEnvironmentExecuteSubscriptionWithMatchTestCommentFragment$fragmentType,
  |},
|};
export type RelayModernEnvironmentExecuteSubscriptionWithMatchTestCommentQueryResponse = RelayModernEnvironmentExecuteSubscriptionWithMatchTestCommentQuery$data;
export type RelayModernEnvironmentExecuteSubscriptionWithMatchTestCommentQuery = {|
  variables: RelayModernEnvironmentExecuteSubscriptionWithMatchTestCommentQueryVariables,
  response: RelayModernEnvironmentExecuteSubscriptionWithMatchTestCommentQuery$data,
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
  "name": "id",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentExecuteSubscriptionWithMatchTestCommentQuery",
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
            "args": null,
            "kind": "FragmentSpread",
            "name": "RelayModernEnvironmentExecuteSubscriptionWithMatchTestCommentFragment"
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
    "name": "RelayModernEnvironmentExecuteSubscriptionWithMatchTestCommentQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v3/*: any*/),
          (v2/*: any*/),
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
                  (v3/*: any*/),
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
                      (v3/*: any*/),
                      {
                        "kind": "InlineFragment",
                        "selections": [
                          {
                            "args": null,
                            "documentName": "RelayModernEnvironmentExecuteSubscriptionWithMatchTestCommentFragment",
                            "fragmentName": "RelayModernEnvironmentExecuteSubscriptionWithMatchTestPlainUserNameRenderer_name",
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
                            "documentName": "RelayModernEnvironmentExecuteSubscriptionWithMatchTestCommentFragment",
                            "fragmentName": "RelayModernEnvironmentExecuteSubscriptionWithMatchTestMarkdownUserNameRenderer_name",
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
                  (v2/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "type": "Comment",
            "abstractKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "ed41405c3a5162a1938cd19e87131d79",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentExecuteSubscriptionWithMatchTestCommentQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentExecuteSubscriptionWithMatchTestCommentQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    id\n    ...RelayModernEnvironmentExecuteSubscriptionWithMatchTestCommentFragment\n  }\n}\n\nfragment RelayModernEnvironmentExecuteSubscriptionWithMatchTestCommentFragment on Comment {\n  id\n  actor {\n    __typename\n    name\n    nameRenderer(supported: [\"PlainUserNameRenderer\", \"MarkdownUserNameRenderer\"]) {\n      __typename\n      ... on PlainUserNameRenderer {\n        ...RelayModernEnvironmentExecuteSubscriptionWithMatchTestPlainUserNameRenderer_name\n        __module_operation_RelayModernEnvironmentExecuteSubscriptionWithMatchTestCommentFragment: js(module: \"RelayModernEnvironmentExecuteSubscriptionWithMatchTestPlainUserNameRenderer_name$normalization.graphql\", id: \"RelayModernEnvironmentExecuteSubscriptionWithMatchTestCommentFragment.actor.nameRenderer\")\n        __module_component_RelayModernEnvironmentExecuteSubscriptionWithMatchTestCommentFragment: js(module: \"PlainUserNameRenderer.react\", id: \"RelayModernEnvironmentExecuteSubscriptionWithMatchTestCommentFragment.actor.nameRenderer\")\n      }\n      ... on MarkdownUserNameRenderer {\n        ...RelayModernEnvironmentExecuteSubscriptionWithMatchTestMarkdownUserNameRenderer_name\n        __module_operation_RelayModernEnvironmentExecuteSubscriptionWithMatchTestCommentFragment: js(module: \"RelayModernEnvironmentExecuteSubscriptionWithMatchTestMarkdownUserNameRenderer_name$normalization.graphql\", id: \"RelayModernEnvironmentExecuteSubscriptionWithMatchTestCommentFragment.actor.nameRenderer\")\n        __module_component_RelayModernEnvironmentExecuteSubscriptionWithMatchTestCommentFragment: js(module: \"MarkdownUserNameRenderer.react\", id: \"RelayModernEnvironmentExecuteSubscriptionWithMatchTestCommentFragment.actor.nameRenderer\")\n      }\n    }\n    id\n  }\n}\n\nfragment RelayModernEnvironmentExecuteSubscriptionWithMatchTestMarkdownUserNameRenderer_name on MarkdownUserNameRenderer {\n  __typename\n  markdown\n  data {\n    markup\n    id\n  }\n}\n\nfragment RelayModernEnvironmentExecuteSubscriptionWithMatchTestPlainUserNameRenderer_name on PlainUserNameRenderer {\n  plaintext\n  data {\n    text\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "aee303d0628e74c59aab556254f67057";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentExecuteSubscriptionWithMatchTestCommentQuery$variables,
  RelayModernEnvironmentExecuteSubscriptionWithMatchTestCommentQuery$data,
>*/);
