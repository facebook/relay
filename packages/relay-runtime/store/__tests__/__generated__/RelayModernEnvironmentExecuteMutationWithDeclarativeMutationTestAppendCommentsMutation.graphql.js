/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<6d359263463285c11dd2af22bac0e756>>
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
export type RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestAppendCommentsMutation$variables = {|
  connections: $ReadOnlyArray<string>,
  edgeTypeName: string,
  input?: ?CommentsCreateInput,
|};
export type RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestAppendCommentsMutationVariables = RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestAppendCommentsMutation$variables;
export type RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestAppendCommentsMutation$data = {|
  +commentsCreate: ?{|
    +comments: ?$ReadOnlyArray<?{|
      +id: string,
    |}>,
  |},
|};
export type RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestAppendCommentsMutationResponse = RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestAppendCommentsMutation$data;
export type RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestAppendCommentsMutation = {|
  variables: RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestAppendCommentsMutationVariables,
  response: RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestAppendCommentsMutation$data,
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
  "name": "comments",
  "plural": true,
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
    "name": "RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestAppendCommentsMutation",
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
    "name": "RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestAppendCommentsMutation",
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
            "handle": "appendNode",
            "key": "",
            "kind": "LinkedHandle",
            "name": "comments",
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
    "cacheID": "6f370c637092715b6a1f65e390472201",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestAppendCommentsMutation",
    "operationKind": "mutation",
    "text": "mutation RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestAppendCommentsMutation(\n  $input: CommentsCreateInput\n) {\n  commentsCreate(input: $input) {\n    comments {\n      id\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "57b8c462283bf55892b339592e2b5339";
}

module.exports = ((node/*: any*/)/*: Mutation<
  RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestAppendCommentsMutation$variables,
  RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestAppendCommentsMutation$data,
>*/);
