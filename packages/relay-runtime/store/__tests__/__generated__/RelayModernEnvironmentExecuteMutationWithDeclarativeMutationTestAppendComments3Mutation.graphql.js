/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<dbe901dc28b6e2f9f8e9d1424b3f5240>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Mutation } from 'relay-runtime';
export type CommentsCreateInput = {|
  clientMutationId?: ?string,
  feedbackId?: ?string,
  feedback?: ?$ReadOnlyArray<?CommentfeedbackFeedback>,
|};
export type CommentfeedbackFeedback = {|
  comment?: ?FeedbackcommentComment,
|};
export type FeedbackcommentComment = {|
  feedback?: ?CommentfeedbackFeedback,
|};
export type RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestAppendComments3Mutation$variables = {|
  connections: $ReadOnlyArray<string>,
  input?: ?CommentsCreateInput,
|};
export type RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestAppendComments3MutationVariables = RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestAppendComments3Mutation$variables;
export type RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestAppendComments3Mutation$data = {|
  +commentsCreate: ?{|
    +feedbackCommentEdges: ?$ReadOnlyArray<?{|
      +cursor: ?string,
      +node: ?{|
        +id: string,
      |},
    |}>,
  |},
|};
export type RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestAppendComments3MutationResponse = RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestAppendComments3Mutation$data;
export type RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestAppendComments3Mutation = {|
  variables: RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestAppendComments3MutationVariables,
  response: RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestAppendComments3Mutation$data,
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
  "concreteType": "CommentsEdge",
  "kind": "LinkedField",
  "name": "feedbackCommentEdges",
  "plural": true,
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
        }
      ],
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
    "name": "RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestAppendComments3Mutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "CommentsCreateResponsePayload",
        "kind": "LinkedField",
        "name": "commentsCreate",
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
    "name": "RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestAppendComments3Mutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "CommentsCreateResponsePayload",
        "kind": "LinkedField",
        "name": "commentsCreate",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "alias": null,
            "args": null,
            "filters": null,
            "handle": "appendEdge",
            "key": "",
            "kind": "LinkedHandle",
            "name": "feedbackCommentEdges",
            "handleArgs": [
              {
                "kind": "Variable",
                "name": "connections",
                "variableName": "connections"
              }
            ]
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "9daa527972275ecc75d767e5f75bd3e1",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestAppendComments3Mutation",
    "operationKind": "mutation",
    "text": "mutation RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestAppendComments3Mutation(\n  $input: CommentsCreateInput\n) {\n  commentsCreate(input: $input) {\n    feedbackCommentEdges {\n      cursor\n      node {\n        id\n      }\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "975c794bccf4fcb2c483d9947130d999";
}

module.exports = ((node/*: any*/)/*: Mutation<
  RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestAppendComments3Mutation$variables,
  RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestAppendComments3Mutation$data,
>*/);
