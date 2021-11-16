/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<5b5d9dd41a250002737b8b2956eb006e>>
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
export type RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestPrependComments2Mutation$variables = {|
  connections: $ReadOnlyArray<string>,
  input?: ?CommentsCreateInput,
|};
export type RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestPrependComments2MutationVariables = RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestPrependComments2Mutation$variables;
export type RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestPrependComments2Mutation$data = {|
  +commentsCreate: ?{|
    +feedbackCommentEdges: ?$ReadOnlyArray<?{|
      +cursor: ?string,
      +node: ?{|
        +id: string,
      |},
    |}>,
  |},
|};
export type RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestPrependComments2MutationResponse = RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestPrependComments2Mutation$data;
export type RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestPrependComments2Mutation = {|
  variables: RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestPrependComments2MutationVariables,
  response: RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestPrependComments2Mutation$data,
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
    "name": "RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestPrependComments2Mutation",
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
    "name": "RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestPrependComments2Mutation",
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
            "handle": "prependEdge",
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
    "cacheID": "8085d707f17ba5861cc2663d0a0c3d24",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestPrependComments2Mutation",
    "operationKind": "mutation",
    "text": "mutation RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestPrependComments2Mutation(\n  $input: CommentsCreateInput\n) {\n  commentsCreate(input: $input) {\n    feedbackCommentEdges {\n      cursor\n      node {\n        id\n      }\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "e0642572a24c7ba9a34f890b6053eb98";
}

module.exports = ((node/*: any*/)/*: Mutation<
  RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestPrependComments2Mutation$variables,
  RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestPrependComments2Mutation$data,
>*/);
