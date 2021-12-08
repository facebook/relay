/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<6a77d0b59b59849ccee40c45674d792e>>
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
export type RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestAppendCommentMutation$variables = {|
  connections: $ReadOnlyArray<string>,
  edgeTypeName: string,
  input?: ?CommentCreateInput,
|};
export type RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestAppendCommentMutationVariables = RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestAppendCommentMutation$variables;
export type RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestAppendCommentMutation$data = {|
  +commentCreate: ?{|
    +comment: ?{|
      +id: string,
    |},
  |},
|};
export type RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestAppendCommentMutationResponse = RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestAppendCommentMutation$data;
export type RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestAppendCommentMutation = {|
  variables: RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestAppendCommentMutationVariables,
  response: RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestAppendCommentMutation$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "connections"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "edgeTypeName"
  },
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
    }
  ],
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestAppendCommentMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "CommentCreateResponsePayload",
        "kind": "LinkedField",
        "name": "commentCreate",
        "plural": false,
        "selections": [
          (v2/*: any*/)
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
    "name": "RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestAppendCommentMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "CommentCreateResponsePayload",
        "kind": "LinkedField",
        "name": "commentCreate",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "alias": null,
            "args": null,
            "filters": null,
            "handle": "appendNode",
            "key": "",
            "kind": "LinkedHandle",
            "name": "comment",
            "handleArgs": [
              {
                "kind": "Variable",
                "name": "connections",
                "variableName": "connections"
              },
              {
                "kind": "Variable",
                "name": "edgeTypeName",
                "variableName": "edgeTypeName"
              }
            ]
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "0fa5abfee4d71bd2c9cc4948aa38f438",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestAppendCommentMutation",
    "operationKind": "mutation",
    "text": "mutation RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestAppendCommentMutation(\n  $input: CommentCreateInput\n) {\n  commentCreate(input: $input) {\n    comment {\n      id\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "505cc37a555b53ab612fd196f0902846";
}

module.exports = ((node/*: any*/)/*: Mutation<
  RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestAppendCommentMutation$variables,
  RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestAppendCommentMutation$data,
>*/);
