/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<2010b64ff440b1ba129d690069757216>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
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
export type RelayModernEnvironmentWithOperationTrackerTest1MutationVariables = {|
  input?: ?CommentCreateInput,
|};
export type RelayModernEnvironmentWithOperationTrackerTest1MutationResponse = {|
  +commentCreate: ?{|
    +comment: ?{|
      +id: string,
      +message: ?{|
        +text: ?string,
      |},
    |},
    +feedback: ?{|
      +id: string,
      +body: ?{|
        +text: ?string,
      |},
    |},
  |},
|};
export type RelayModernEnvironmentWithOperationTrackerTest1Mutation = {|
  variables: RelayModernEnvironmentWithOperationTrackerTest1MutationVariables,
  response: RelayModernEnvironmentWithOperationTrackerTest1MutationResponse,
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
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v2 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "text",
    "storageKey": null
  }
],
v3 = [
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
          (v1/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "Text",
            "kind": "LinkedField",
            "name": "message",
            "plural": false,
            "selections": (v2/*: any*/),
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "Feedback",
        "kind": "LinkedField",
        "name": "feedback",
        "plural": false,
        "selections": [
          (v1/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "Text",
            "kind": "LinkedField",
            "name": "body",
            "plural": false,
            "selections": (v2/*: any*/),
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "storageKey": null
  }
],
v4 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ID"
},
v5 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "Text"
},
v6 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "String"
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentWithOperationTrackerTest1Mutation",
    "selections": (v3/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RelayModernEnvironmentWithOperationTrackerTest1Mutation",
    "selections": (v3/*: any*/)
  },
  "params": {
    "cacheID": "33e7acb2141a8b4cc30d8eb08feb28b2",
    "id": null,
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "commentCreate": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "CommentCreateResponsePayload"
        },
        "commentCreate.comment": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Comment"
        },
        "commentCreate.comment.id": (v4/*: any*/),
        "commentCreate.comment.message": (v5/*: any*/),
        "commentCreate.comment.message.text": (v6/*: any*/),
        "commentCreate.feedback": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Feedback"
        },
        "commentCreate.feedback.body": (v5/*: any*/),
        "commentCreate.feedback.body.text": (v6/*: any*/),
        "commentCreate.feedback.id": (v4/*: any*/)
      }
    },
    "name": "RelayModernEnvironmentWithOperationTrackerTest1Mutation",
    "operationKind": "mutation",
    "text": "mutation RelayModernEnvironmentWithOperationTrackerTest1Mutation(\n  $input: CommentCreateInput\n) {\n  commentCreate(input: $input) {\n    comment {\n      id\n      message {\n        text\n      }\n    }\n    feedback {\n      id\n      body {\n        text\n      }\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "191ed594a345f64de3ccd4b8bc51e924";
}

module.exports = node;
