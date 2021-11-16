/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<1d005ce3b375a52bac94a822b6af6fa4>>
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
export type RelayOperationTrackerTest1Mutation$variables = {|
  input?: ?CommentCreateInput,
|};
export type RelayOperationTrackerTest1MutationVariables = RelayOperationTrackerTest1Mutation$variables;
export type RelayOperationTrackerTest1Mutation$data = {|
  +commentCreate: ?{|
    +__typename: string,
  |},
|};
export type RelayOperationTrackerTest1MutationResponse = RelayOperationTrackerTest1Mutation$data;
export type RelayOperationTrackerTest1Mutation = {|
  variables: RelayOperationTrackerTest1MutationVariables,
  response: RelayOperationTrackerTest1Mutation$data,
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
        "kind": "ScalarField",
        "name": "__typename",
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
    "name": "RelayOperationTrackerTest1Mutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RelayOperationTrackerTest1Mutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "e17c7ce2d5e426037d4264a98b978a9f",
    "id": null,
    "metadata": {},
    "name": "RelayOperationTrackerTest1Mutation",
    "operationKind": "mutation",
    "text": "mutation RelayOperationTrackerTest1Mutation(\n  $input: CommentCreateInput\n) {\n  commentCreate(input: $input) {\n    __typename\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "a8b4fecd1f7151d129643e38bba2bb6a";
}

module.exports = ((node/*: any*/)/*: Mutation<
  RelayOperationTrackerTest1Mutation$variables,
  RelayOperationTrackerTest1Mutation$data,
>*/);
