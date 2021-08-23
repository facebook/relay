/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<f234fe5df2a9e428cedbe17d22217c67>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @dataDrivenDependency RelayModernEnvironmentExecuteSubscriptionWithMatchTestCommentCreateSubscription.commentCreateSubscribe.comment.actor.nameRenderer {"branches":{"MarkdownUserNameRenderer":{"component":"MarkdownUserNameRenderer.react","fragment":"RelayModernEnvironmentExecuteSubscriptionWithMatchTestMarkdownUserNameRenderer_name$normalization.graphql"},"PlainUserNameRenderer":{"component":"PlainUserNameRenderer.react","fragment":"RelayModernEnvironmentExecuteSubscriptionWithMatchTestPlainUserNameRenderer_name$normalization.graphql"}},"plural":false}

/*::
import type { ConcreteRequest } from 'relay-runtime';
type RelayModernEnvironmentExecuteSubscriptionWithMatchTestMarkdownUserNameRenderer_name$ref = any;
type RelayModernEnvironmentExecuteSubscriptionWithMatchTestPlainUserNameRenderer_name$ref = any;
export type CommentCreateSubscriptionInput = {|
  clientSubscriptionId?: ?string,
  feedbackId?: ?string,
  text?: ?string,
|};
export type RelayModernEnvironmentExecuteSubscriptionWithMatchTestCommentCreateSubscriptionVariables = {|
  input: CommentCreateSubscriptionInput,
|};
export type RelayModernEnvironmentExecuteSubscriptionWithMatchTestCommentCreateSubscriptionResponse = {|
  +commentCreateSubscribe: ?{|
    +comment: ?{|
      +actor: ?{|
        +name: ?string,
        +nameRenderer: ?{|
          +__fragmentPropName?: ?string,
          +__module_component?: ?string,
          +$fragmentRefs: RelayModernEnvironmentExecuteSubscriptionWithMatchTestPlainUserNameRenderer_name$ref & RelayModernEnvironmentExecuteSubscriptionWithMatchTestMarkdownUserNameRenderer_name$ref,
        |},
      |},
    |},
  |},
|};
export type RelayModernEnvironmentExecuteSubscriptionWithMatchTestCommentCreateSubscription = {|
  variables: RelayModernEnvironmentExecuteSubscriptionWithMatchTestCommentCreateSubscriptionVariables,
  response: RelayModernEnvironmentExecuteSubscriptionWithMatchTestCommentCreateSubscriptionResponse,
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
    "value": [
      "PlainUserNameRenderer",
      "MarkdownUserNameRenderer"
    ]
  }
],
v4 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "args": null,
      "documentName": "RelayModernEnvironmentExecuteSubscriptionWithMatchTestCommentCreateSubscription",
      "fragmentName": "RelayModernEnvironmentExecuteSubscriptionWithMatchTestPlainUserNameRenderer_name",
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
      "documentName": "RelayModernEnvironmentExecuteSubscriptionWithMatchTestCommentCreateSubscription",
      "fragmentName": "RelayModernEnvironmentExecuteSubscriptionWithMatchTestMarkdownUserNameRenderer_name",
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
    "name": "RelayModernEnvironmentExecuteSubscriptionWithMatchTestCommentCreateSubscription",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "CommentCreateResponsePayload",
        "kind": "LinkedField",
        "name": "commentCreateSubscribe",
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
                    "storageKey": "nameRenderer(supported:[\"PlainUserNameRenderer\",\"MarkdownUserNameRenderer\"])"
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
    "type": "Subscription",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RelayModernEnvironmentExecuteSubscriptionWithMatchTestCommentCreateSubscription",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "CommentCreateResponsePayload",
        "kind": "LinkedField",
        "name": "commentCreateSubscribe",
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
                    "storageKey": "nameRenderer(supported:[\"PlainUserNameRenderer\",\"MarkdownUserNameRenderer\"])"
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
    "cacheID": "601e62ff5c9e358b7e0b3ef618d91480",
    "id": null,
    "metadata": {
      "subscriptionName": "commentCreateSubscribe"
    },
    "name": "RelayModernEnvironmentExecuteSubscriptionWithMatchTestCommentCreateSubscription",
    "operationKind": "subscription",
    "text": "subscription RelayModernEnvironmentExecuteSubscriptionWithMatchTestCommentCreateSubscription(\n  $input: CommentCreateSubscriptionInput!\n) {\n  commentCreateSubscribe(input: $input) {\n    comment {\n      actor {\n        __typename\n        name\n        nameRenderer(supported: [\"PlainUserNameRenderer\", \"MarkdownUserNameRenderer\"]) {\n          __typename\n          ... on PlainUserNameRenderer {\n            ...RelayModernEnvironmentExecuteSubscriptionWithMatchTestPlainUserNameRenderer_name\n            __module_operation_RelayModernEnvironmentExecuteSubscriptionWithMatchTestCommentCreateSubscription: js(module: \"RelayModernEnvironmentExecuteSubscriptionWithMatchTestPlainUserNameRenderer_name$normalization.graphql\", id: \"RelayModernEnvironmentExecuteSubscriptionWithMatchTestCommentCreateSubscription.commentCreateSubscribe.comment.actor.nameRenderer\")\n            __module_component_RelayModernEnvironmentExecuteSubscriptionWithMatchTestCommentCreateSubscription: js(module: \"PlainUserNameRenderer.react\", id: \"RelayModernEnvironmentExecuteSubscriptionWithMatchTestCommentCreateSubscription.commentCreateSubscribe.comment.actor.nameRenderer\")\n          }\n          ... on MarkdownUserNameRenderer {\n            ...RelayModernEnvironmentExecuteSubscriptionWithMatchTestMarkdownUserNameRenderer_name\n            __module_operation_RelayModernEnvironmentExecuteSubscriptionWithMatchTestCommentCreateSubscription: js(module: \"RelayModernEnvironmentExecuteSubscriptionWithMatchTestMarkdownUserNameRenderer_name$normalization.graphql\", id: \"RelayModernEnvironmentExecuteSubscriptionWithMatchTestCommentCreateSubscription.commentCreateSubscribe.comment.actor.nameRenderer\")\n            __module_component_RelayModernEnvironmentExecuteSubscriptionWithMatchTestCommentCreateSubscription: js(module: \"MarkdownUserNameRenderer.react\", id: \"RelayModernEnvironmentExecuteSubscriptionWithMatchTestCommentCreateSubscription.commentCreateSubscribe.comment.actor.nameRenderer\")\n          }\n        }\n        id\n      }\n      id\n    }\n  }\n}\n\nfragment RelayModernEnvironmentExecuteSubscriptionWithMatchTestMarkdownUserNameRenderer_name on MarkdownUserNameRenderer {\n  __typename\n  markdown\n  data {\n    markup\n    id\n  }\n}\n\nfragment RelayModernEnvironmentExecuteSubscriptionWithMatchTestPlainUserNameRenderer_name on PlainUserNameRenderer {\n  plaintext\n  data {\n    text\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "7ff1492359f8843cfbc0780bb95cbbde";
}

module.exports = node;
