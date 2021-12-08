/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<151ad570c96795a82f2b5a714931e4aa>>
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
export type MultiActorEnvironmentExecuteMutationTestCreateCommentMutation$variables = {|
  input: CommentCreateInput,
|};
export type MultiActorEnvironmentExecuteMutationTestCreateCommentMutationVariables = MultiActorEnvironmentExecuteMutationTestCreateCommentMutation$variables;
export type MultiActorEnvironmentExecuteMutationTestCreateCommentMutation$data = {|
  +commentCreate: ?{|
    +comment: ?{|
      +id: string,
      +body: ?{|
        +text: ?string,
      |},
    |},
  |},
|};
export type MultiActorEnvironmentExecuteMutationTestCreateCommentMutationResponse = MultiActorEnvironmentExecuteMutationTestCreateCommentMutation$data;
export type MultiActorEnvironmentExecuteMutationTestCreateCommentMutation = {|
  variables: MultiActorEnvironmentExecuteMutationTestCreateCommentMutationVariables,
  response: MultiActorEnvironmentExecuteMutationTestCreateCommentMutation$data,
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
    "name": "MultiActorEnvironmentExecuteMutationTestCreateCommentMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "MultiActorEnvironmentExecuteMutationTestCreateCommentMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "bf2c895e7b5441ad12901639c92d113b",
    "id": null,
    "metadata": {},
    "name": "MultiActorEnvironmentExecuteMutationTestCreateCommentMutation",
    "operationKind": "mutation",
    "text": "mutation MultiActorEnvironmentExecuteMutationTestCreateCommentMutation(\n  $input: CommentCreateInput!\n) {\n  commentCreate(input: $input) {\n    comment {\n      id\n      body {\n        text\n      }\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "539386332425cbe8c263e699decf8325";
}

module.exports = ((node/*: any*/)/*: Mutation<
  MultiActorEnvironmentExecuteMutationTestCreateCommentMutation$variables,
  MultiActorEnvironmentExecuteMutationTestCreateCommentMutation$data,
>*/);
