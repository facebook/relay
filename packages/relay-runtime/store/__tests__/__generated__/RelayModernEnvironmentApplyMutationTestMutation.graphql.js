/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<cf380a3c46b2d107ba17731561812572>>
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
export type RelayModernEnvironmentApplyMutationTestMutation$variables = {|
  input: CommentCreateInput,
|};
export type RelayModernEnvironmentApplyMutationTestMutationVariables = RelayModernEnvironmentApplyMutationTestMutation$variables;
export type RelayModernEnvironmentApplyMutationTestMutation$data = {|
  +commentCreate: ?{|
    +comment: ?{|
      +id: string,
      +body: ?{|
        +text: ?string,
      |},
    |},
  |},
|};
export type RelayModernEnvironmentApplyMutationTestMutationResponse = RelayModernEnvironmentApplyMutationTestMutation$data;
export type RelayModernEnvironmentApplyMutationTestMutation = {|
  variables: RelayModernEnvironmentApplyMutationTestMutationVariables,
  response: RelayModernEnvironmentApplyMutationTestMutation$data,
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
    "name": "RelayModernEnvironmentApplyMutationTestMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RelayModernEnvironmentApplyMutationTestMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "f1dc28df73a54b116d8f3e830198176c",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentApplyMutationTestMutation",
    "operationKind": "mutation",
    "text": "mutation RelayModernEnvironmentApplyMutationTestMutation(\n  $input: CommentCreateInput!\n) {\n  commentCreate(input: $input) {\n    comment {\n      id\n      body {\n        text\n      }\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "8f6539466374b4a84e29c1ff8cf94b75";
}

module.exports = ((node/*: any*/)/*: Mutation<
  RelayModernEnvironmentApplyMutationTestMutation$variables,
  RelayModernEnvironmentApplyMutationTestMutation$data,
>*/);
