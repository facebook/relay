/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<5d0ea50785af16a4756898a6f3a3c04c>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Mutation } from 'relay-runtime';
export type CommentCreateInput = {|
  clientMutationId?: ?string,
  feedbackId?: ?string,
  feedback?: ?CommentfeedbackFeedback,
|};
export type CommentfeedbackFeedback = {|
  comment?: ?FeedbackcommentComment,
|};
export type FeedbackcommentComment = {|
  feedback?: ?CommentfeedbackFeedback,
|};
export type RelayModernEnvironmentExecuteMutationWithGlobalInvalidationTestCreateCommentMutation$variables = {|
  input: CommentCreateInput,
|};
export type RelayModernEnvironmentExecuteMutationWithGlobalInvalidationTestCreateCommentMutationVariables = RelayModernEnvironmentExecuteMutationWithGlobalInvalidationTestCreateCommentMutation$variables;
export type RelayModernEnvironmentExecuteMutationWithGlobalInvalidationTestCreateCommentMutation$data = {|
  +commentCreate: ?{|
    +comment: ?{|
      +id: string,
      +body: ?{|
        +text: ?string,
      |},
    |},
  |},
|};
export type RelayModernEnvironmentExecuteMutationWithGlobalInvalidationTestCreateCommentMutationResponse = RelayModernEnvironmentExecuteMutationWithGlobalInvalidationTestCreateCommentMutation$data;
export type RelayModernEnvironmentExecuteMutationWithGlobalInvalidationTestCreateCommentMutation = {|
  variables: RelayModernEnvironmentExecuteMutationWithGlobalInvalidationTestCreateCommentMutationVariables,
  response: RelayModernEnvironmentExecuteMutationWithGlobalInvalidationTestCreateCommentMutation$data,
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
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
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
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          },
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
        ],
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentExecuteMutationWithGlobalInvalidationTestCreateCommentMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RelayModernEnvironmentExecuteMutationWithGlobalInvalidationTestCreateCommentMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "ea1d7df8f975ff7d645c6eb22022ebb3",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentExecuteMutationWithGlobalInvalidationTestCreateCommentMutation",
    "operationKind": "mutation",
    "text": "mutation RelayModernEnvironmentExecuteMutationWithGlobalInvalidationTestCreateCommentMutation(\n  $input: CommentCreateInput!\n) {\n  commentCreate(input: $input) {\n    comment {\n      id\n      body {\n        text\n      }\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "5fe8d31255a57d03426f7ce2385e5910";
}

module.exports = ((node/*: any*/)/*: Mutation<
  RelayModernEnvironmentExecuteMutationWithGlobalInvalidationTestCreateCommentMutation$variables,
  RelayModernEnvironmentExecuteMutationWithGlobalInvalidationTestCreateCommentMutation$data,
>*/);
