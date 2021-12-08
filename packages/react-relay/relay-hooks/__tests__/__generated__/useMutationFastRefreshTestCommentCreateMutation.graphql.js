/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<00fe43e30f5f68bb1a20ae4f44346a83>>
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
export type useMutationFastRefreshTestCommentCreateMutation$variables = {|
  input?: ?CommentCreateInput,
|};
export type useMutationFastRefreshTestCommentCreateMutationVariables = useMutationFastRefreshTestCommentCreateMutation$variables;
export type useMutationFastRefreshTestCommentCreateMutation$data = {|
  +commentCreate: ?{|
    +feedbackCommentEdge: ?{|
      +cursor: ?string,
      +node: ?{|
        +id: string,
        +body: ?{|
          +text: ?string,
        |},
      |},
    |},
  |},
|};
export type useMutationFastRefreshTestCommentCreateMutationResponse = useMutationFastRefreshTestCommentCreateMutation$data;
export type useMutationFastRefreshTestCommentCreateMutation = {|
  variables: useMutationFastRefreshTestCommentCreateMutationVariables,
  response: useMutationFastRefreshTestCommentCreateMutation$data,
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
        "concreteType": "CommentsEdge",
        "kind": "LinkedField",
        "name": "feedbackCommentEdge",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "cursor",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "Comment",
            "kind": "LinkedField",
            "name": "node",
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
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "useMutationFastRefreshTestCommentCreateMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "useMutationFastRefreshTestCommentCreateMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "11f37ac72f53f8fd3c69fa772ca756f9",
    "id": null,
    "metadata": {},
    "name": "useMutationFastRefreshTestCommentCreateMutation",
    "operationKind": "mutation",
    "text": "mutation useMutationFastRefreshTestCommentCreateMutation(\n  $input: CommentCreateInput\n) {\n  commentCreate(input: $input) {\n    feedbackCommentEdge {\n      cursor\n      node {\n        id\n        body {\n          text\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "97430a57093eac226b7c8c315e30f400";
}

module.exports = ((node/*: any*/)/*: Mutation<
  useMutationFastRefreshTestCommentCreateMutation$variables,
  useMutationFastRefreshTestCommentCreateMutation$data,
>*/);
