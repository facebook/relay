/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<dc137bd1d5db5c46c2aa09bf97d44ed1>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @dataDrivenDependency RelayModernEnvironmentExecuteMutationWithMatchTestCreateCommentMutation.commentCreate.comment.actor.nameRenderer {"branches":{"MarkdownUserNameRenderer":{"component":"MarkdownUserNameRenderer.react","fragment":"RelayModernEnvironmentExecuteMutationWithMatchTestMarkdownUserNameRenderer_name$normalization.graphql"},"PlainUserNameRenderer":{"component":"PlainUserNameRenderer.react","fragment":"RelayModernEnvironmentExecuteMutationWithMatchTestPlainUserNameRenderer_name$normalization.graphql"}},"plural":false}

/*::
import type { ConcreteRequest, Mutation } from 'relay-runtime';
import type { RelayModernEnvironmentExecuteMutationWithMatchTestMarkdownUserNameRenderer_name$fragmentType } from "./RelayModernEnvironmentExecuteMutationWithMatchTestMarkdownUserNameRenderer_name.graphql";
import type { RelayModernEnvironmentExecuteMutationWithMatchTestPlainUserNameRenderer_name$fragmentType } from "./RelayModernEnvironmentExecuteMutationWithMatchTestPlainUserNameRenderer_name.graphql";
export type CommentCreateInput = {|
  feedback?: ?CommentfeedbackFeedback,
  feedbackId?: ?string,
|};
export type CommentfeedbackFeedback = {|
  comment?: ?FeedbackcommentComment,
|};
export type FeedbackcommentComment = {|
  feedback?: ?CommentfeedbackFeedback,
|};
export type RelayModernEnvironmentExecuteMutationWithMatchTestCreateCommentMutation$variables = {|
  input: CommentCreateInput,
|};
export type RelayModernEnvironmentExecuteMutationWithMatchTestCreateCommentMutation$data = {|
  +commentCreate: ?{|
    +comment: ?{|
      +actor: ?{|
        +name: ?string,
        +nameRenderer: ?{|
          +__fragmentPropName?: ?string,
          +__module_component?: ?string,
          +$fragmentSpreads: RelayModernEnvironmentExecuteMutationWithMatchTestMarkdownUserNameRenderer_name$fragmentType & RelayModernEnvironmentExecuteMutationWithMatchTestPlainUserNameRenderer_name$fragmentType,
        |},
      |},
    |},
  |},
|};
export type RelayModernEnvironmentExecuteMutationWithMatchTestCreateCommentMutation = {|
  response: RelayModernEnvironmentExecuteMutationWithMatchTestCreateCommentMutation$data,
  variables: RelayModernEnvironmentExecuteMutationWithMatchTestCreateCommentMutation$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "input",
    "variableName": "input"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v3 = [
  {
    "kind": "Literal",
    "name": "supported",
    "value": "34hjiS"
  }
],
v4 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "args": null,
      "documentName": "RelayModernEnvironmentExecuteMutationWithMatchTestCreateCommentMutation",
      "fragmentName": "RelayModernEnvironmentExecuteMutationWithMatchTestPlainUserNameRenderer_name",
      "fragmentPropName": "name",
      "kind": "ModuleImport"
    }
  ],
  "type": "PlainUserNameRenderer",
  "abstractKey": null
},
v5 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "args": null,
      "documentName": "RelayModernEnvironmentExecuteMutationWithMatchTestCreateCommentMutation",
      "fragmentName": "RelayModernEnvironmentExecuteMutationWithMatchTestMarkdownUserNameRenderer_name",
      "fragmentPropName": "name",
      "kind": "ModuleImport"
    }
  ],
  "type": "MarkdownUserNameRenderer",
  "abstractKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentExecuteMutationWithMatchTestCreateCommentMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "CommentCreateResponsePayload",
        "kind": "LinkedField",
        "name": "commentCreate",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "Comment",
            "kind": "LinkedField",
            "name": "comment",
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
                  (v2/*: any*/),
                  {
                    "alias": null,
                    "args": (v3/*: any*/),
                    "concreteType": null,
                    "kind": "LinkedField",
                    "name": "nameRenderer",
                    "plural": false,
                    "selections": [
                      (v4/*: any*/),
                      (v5/*: any*/)
                    ],
                    "storageKey": "nameRenderer(supported:\"34hjiS\")"
                  }
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
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RelayModernEnvironmentExecuteMutationWithMatchTestCreateCommentMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "CommentCreateResponsePayload",
        "kind": "LinkedField",
        "name": "commentCreate",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "Comment",
            "kind": "LinkedField",
            "name": "comment",
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
                  (v6/*: any*/),
                  (v2/*: any*/),
                  {
                    "alias": null,
                    "args": (v3/*: any*/),
                    "concreteType": null,
                    "kind": "LinkedField",
                    "name": "nameRenderer",
                    "plural": false,
                    "selections": [
                      (v6/*: any*/),
                      (v4/*: any*/),
                      (v5/*: any*/)
                    ],
                    "storageKey": "nameRenderer(supported:\"34hjiS\")"
                  },
                  (v7/*: any*/)
                ],
                "storageKey": null
              },
              (v7/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "ca31671fbe0da523993161711a5537ba",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentExecuteMutationWithMatchTestCreateCommentMutation",
    "operationKind": "mutation",
    "text": "mutation RelayModernEnvironmentExecuteMutationWithMatchTestCreateCommentMutation(\n  $input: CommentCreateInput!\n) {\n  commentCreate(input: $input) {\n    comment {\n      actor {\n        __typename\n        name\n        nameRenderer(supported: [\"PlainUserNameRenderer\", \"MarkdownUserNameRenderer\"]) {\n          __typename\n          ... on PlainUserNameRenderer {\n            ...RelayModernEnvironmentExecuteMutationWithMatchTestPlainUserNameRenderer_name\n            __module_operation_RelayModernEnvironmentExecuteMutationWithMatchTestCreateCommentMutation: js(module: \"RelayModernEnvironmentExecuteMutationWithMatchTestPlainUserNameRenderer_name$normalization.graphql\", id: \"RelayModernEnvironmentExecuteMutationWithMatchTestCreateCommentMutation.commentCreate.comment.actor.nameRenderer\")\n            __module_component_RelayModernEnvironmentExecuteMutationWithMatchTestCreateCommentMutation: js(module: \"PlainUserNameRenderer.react\", id: \"RelayModernEnvironmentExecuteMutationWithMatchTestCreateCommentMutation.commentCreate.comment.actor.nameRenderer\")\n          }\n          ... on MarkdownUserNameRenderer {\n            ...RelayModernEnvironmentExecuteMutationWithMatchTestMarkdownUserNameRenderer_name\n            __module_operation_RelayModernEnvironmentExecuteMutationWithMatchTestCreateCommentMutation: js(module: \"RelayModernEnvironmentExecuteMutationWithMatchTestMarkdownUserNameRenderer_name$normalization.graphql\", id: \"RelayModernEnvironmentExecuteMutationWithMatchTestCreateCommentMutation.commentCreate.comment.actor.nameRenderer\")\n            __module_component_RelayModernEnvironmentExecuteMutationWithMatchTestCreateCommentMutation: js(module: \"MarkdownUserNameRenderer.react\", id: \"RelayModernEnvironmentExecuteMutationWithMatchTestCreateCommentMutation.commentCreate.comment.actor.nameRenderer\")\n          }\n        }\n        id\n      }\n      id\n    }\n  }\n}\n\nfragment RelayModernEnvironmentExecuteMutationWithMatchTestMarkdownUserNameRenderer_name on MarkdownUserNameRenderer {\n  __typename\n  markdown\n  data {\n    markup\n    id\n  }\n}\n\nfragment RelayModernEnvironmentExecuteMutationWithMatchTestPlainUserNameRenderer_name on PlainUserNameRenderer {\n  plaintext\n  data {\n    text\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "8a6c1e92e6379ca2bcf4b83fbdb38c58";
}

module.exports = ((node/*: any*/)/*: Mutation<
  RelayModernEnvironmentExecuteMutationWithMatchTestCreateCommentMutation$variables,
  RelayModernEnvironmentExecuteMutationWithMatchTestCreateCommentMutation$data,
>*/);
