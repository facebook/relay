/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<c88d3280a51bbc5299d83c830e2165d0>>
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
export type RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestPrependCommentsMutation$variables = {|
  connections: $ReadOnlyArray<string>,
  edgeTypeName: string,
  input?: ?CommentsCreateInput,
|};
export type RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestPrependCommentsMutationVariables = RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestPrependCommentsMutation$variables;
export type RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestPrependCommentsMutation$data = {|
  +commentsCreate: ?{|
    +comments: ?$ReadOnlyArray<?{|
      +id: string,
    |}>,
  |},
|};
export type RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestPrependCommentsMutationResponse = RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestPrependCommentsMutation$data;
export type RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestPrependCommentsMutation = {|
  variables: RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestPrependCommentsMutationVariables,
  response: RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestPrependCommentsMutation$data,
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
    "name": "RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestPrependCommentsMutation",
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
    "name": "RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestPrependCommentsMutation",
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
            "handle": "prependNode",
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
    "cacheID": "0e74dc2c4a10174fcf43f63222025591",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestPrependCommentsMutation",
    "operationKind": "mutation",
    "text": "mutation RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestPrependCommentsMutation(\n  $input: CommentsCreateInput\n) {\n  commentsCreate(input: $input) {\n    comments {\n      id\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "335a4356a6e3251202ecaa4449f65213";
}

module.exports = ((node/*: any*/)/*: Mutation<
  RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestPrependCommentsMutation$variables,
  RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestPrependCommentsMutation$data,
>*/);
