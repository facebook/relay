/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<101a554d392facfade815fd9aa8b5f74>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayModernEnvironmentExecuteMutationWithMatchTestCommentFragment$fragmentType = any;
export type RelayModernEnvironmentExecuteMutationWithMatchTestCommentQuery$variables = {|
  id: string,
|};
export type RelayModernEnvironmentExecuteMutationWithMatchTestCommentQueryVariables = RelayModernEnvironmentExecuteMutationWithMatchTestCommentQuery$variables;
export type RelayModernEnvironmentExecuteMutationWithMatchTestCommentQuery$data = {|
  +node: ?{|
    +id: string,
    +$fragmentSpreads: RelayModernEnvironmentExecuteMutationWithMatchTestCommentFragment$fragmentType,
  |},
|};
export type RelayModernEnvironmentExecuteMutationWithMatchTestCommentQueryResponse = RelayModernEnvironmentExecuteMutationWithMatchTestCommentQuery$data;
export type RelayModernEnvironmentExecuteMutationWithMatchTestCommentQuery = {|
  variables: RelayModernEnvironmentExecuteMutationWithMatchTestCommentQueryVariables,
  response: RelayModernEnvironmentExecuteMutationWithMatchTestCommentQuery$data,
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
    "name": "RelayModernEnvironmentExecuteMutationWithMatchTestCommentQuery",
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
            "name": "RelayModernEnvironmentExecuteMutationWithMatchTestCommentFragment"
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
    "name": "RelayModernEnvironmentExecuteMutationWithMatchTestCommentQuery",
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
                            "documentName": "RelayModernEnvironmentExecuteMutationWithMatchTestCommentFragment",
                            "fragmentName": "RelayModernEnvironmentExecuteMutationWithMatchTestPlainUserNameRenderer_name",
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
                            "documentName": "RelayModernEnvironmentExecuteMutationWithMatchTestCommentFragment",
                            "fragmentName": "RelayModernEnvironmentExecuteMutationWithMatchTestMarkdownUserNameRenderer_name",
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
    "cacheID": "03951fd4d968bac68fca4c91e1e0be58",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentExecuteMutationWithMatchTestCommentQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentExecuteMutationWithMatchTestCommentQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    id\n    ...RelayModernEnvironmentExecuteMutationWithMatchTestCommentFragment\n  }\n}\n\nfragment RelayModernEnvironmentExecuteMutationWithMatchTestCommentFragment on Comment {\n  id\n  actor {\n    __typename\n    name\n    nameRenderer(supported: [\"PlainUserNameRenderer\", \"MarkdownUserNameRenderer\"]) {\n      __typename\n      ... on PlainUserNameRenderer {\n        ...RelayModernEnvironmentExecuteMutationWithMatchTestPlainUserNameRenderer_name\n        __module_operation_RelayModernEnvironmentExecuteMutationWithMatchTestCommentFragment: js(module: \"RelayModernEnvironmentExecuteMutationWithMatchTestPlainUserNameRenderer_name$normalization.graphql\", id: \"RelayModernEnvironmentExecuteMutationWithMatchTestCommentFragment.actor.nameRenderer\")\n        __module_component_RelayModernEnvironmentExecuteMutationWithMatchTestCommentFragment: js(module: \"PlainUserNameRenderer.react\", id: \"RelayModernEnvironmentExecuteMutationWithMatchTestCommentFragment.actor.nameRenderer\")\n      }\n      ... on MarkdownUserNameRenderer {\n        ...RelayModernEnvironmentExecuteMutationWithMatchTestMarkdownUserNameRenderer_name\n        __module_operation_RelayModernEnvironmentExecuteMutationWithMatchTestCommentFragment: js(module: \"RelayModernEnvironmentExecuteMutationWithMatchTestMarkdownUserNameRenderer_name$normalization.graphql\", id: \"RelayModernEnvironmentExecuteMutationWithMatchTestCommentFragment.actor.nameRenderer\")\n        __module_component_RelayModernEnvironmentExecuteMutationWithMatchTestCommentFragment: js(module: \"MarkdownUserNameRenderer.react\", id: \"RelayModernEnvironmentExecuteMutationWithMatchTestCommentFragment.actor.nameRenderer\")\n      }\n    }\n    id\n  }\n}\n\nfragment RelayModernEnvironmentExecuteMutationWithMatchTestMarkdownUserNameRenderer_name on MarkdownUserNameRenderer {\n  __typename\n  markdown\n  data {\n    markup\n    id\n  }\n}\n\nfragment RelayModernEnvironmentExecuteMutationWithMatchTestPlainUserNameRenderer_name on PlainUserNameRenderer {\n  plaintext\n  data {\n    text\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "85aee16ac1e83847bd25d209521afc27";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentExecuteMutationWithMatchTestCommentQuery$variables,
  RelayModernEnvironmentExecuteMutationWithMatchTestCommentQuery$data,
>*/);
