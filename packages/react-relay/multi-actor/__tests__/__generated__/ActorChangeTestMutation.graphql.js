/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<2a7ca24a7ae93768c7e5e05436d74dfa>>
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
export type ActorChangeTestMutation$variables = {|
  input?: ?CommentCreateInput,
|};
export type ActorChangeTestMutationVariables = ActorChangeTestMutation$variables;
export type ActorChangeTestMutation$data = {|
  +commentCreate: ?{|
    +__typename: string,
  |},
|};
export type ActorChangeTestMutationResponse = ActorChangeTestMutation$data;
export type ActorChangeTestMutation = {|
  variables: ActorChangeTestMutationVariables,
  response: ActorChangeTestMutation$data,
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
    "name": "ActorChangeTestMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ActorChangeTestMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "2e1db0284258a12ca5a26bae8da5bc69",
    "id": null,
    "metadata": {},
    "name": "ActorChangeTestMutation",
    "operationKind": "mutation",
    "text": "mutation ActorChangeTestMutation(\n  $input: CommentCreateInput\n) {\n  commentCreate(input: $input) {\n    __typename\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "3e2d4f1d45715d73d3246c2153869a67";
}

module.exports = ((node/*: any*/)/*: Mutation<
  ActorChangeTestMutation$variables,
  ActorChangeTestMutation$data,
>*/);
