/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<9cd5605ccf763097fc8801af848f8d23>>
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
export type RelayModernEnvironmentExecuteMutationWithLocalInvalidationTestCreateCommentMutation$variables = {|
  input: CommentCreateInput,
|};
export type RelayModernEnvironmentExecuteMutationWithLocalInvalidationTestCreateCommentMutationVariables = RelayModernEnvironmentExecuteMutationWithLocalInvalidationTestCreateCommentMutation$variables;
export type RelayModernEnvironmentExecuteMutationWithLocalInvalidationTestCreateCommentMutation$data = {|
  +commentCreate: ?{|
    +comment: ?{|
      +id: string,
      +body: ?{|
        +text: ?string,
      |},
    |},
  |},
|};
export type RelayModernEnvironmentExecuteMutationWithLocalInvalidationTestCreateCommentMutationResponse = RelayModernEnvironmentExecuteMutationWithLocalInvalidationTestCreateCommentMutation$data;
export type RelayModernEnvironmentExecuteMutationWithLocalInvalidationTestCreateCommentMutation = {|
  variables: RelayModernEnvironmentExecuteMutationWithLocalInvalidationTestCreateCommentMutationVariables,
  response: RelayModernEnvironmentExecuteMutationWithLocalInvalidationTestCreateCommentMutation$data,
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
    "name": "RelayModernEnvironmentExecuteMutationWithLocalInvalidationTestCreateCommentMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RelayModernEnvironmentExecuteMutationWithLocalInvalidationTestCreateCommentMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "e0750cb7d5a46d2b85c484a3ffadc324",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentExecuteMutationWithLocalInvalidationTestCreateCommentMutation",
    "operationKind": "mutation",
    "text": "mutation RelayModernEnvironmentExecuteMutationWithLocalInvalidationTestCreateCommentMutation(\n  $input: CommentCreateInput!\n) {\n  commentCreate(input: $input) {\n    comment {\n      id\n      body {\n        text\n      }\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "1f5beacf0f37e8f35e267806fb1d442c";
}

module.exports = ((node/*: any*/)/*: Mutation<
  RelayModernEnvironmentExecuteMutationWithLocalInvalidationTestCreateCommentMutation$variables,
  RelayModernEnvironmentExecuteMutationWithLocalInvalidationTestCreateCommentMutation$data,
>*/);
