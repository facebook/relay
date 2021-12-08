/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<7973cc2026237c8acb763f865c0e4c37>>
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
export type RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestPrependComment3Mutation$variables = {|
  connections: $ReadOnlyArray<string>,
  edgeTypeName: string,
  input?: ?CommentCreateInput,
|};
export type RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestPrependComment3MutationVariables = RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestPrependComment3Mutation$variables;
export type RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestPrependComment3Mutation$data = {|
  +commentCreate: ?{|
    +comment: ?{|
      +id: string,
    |},
  |},
|};
export type RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestPrependComment3MutationResponse = RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestPrependComment3Mutation$data;
export type RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestPrependComment3Mutation = {|
  variables: RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestPrependComment3MutationVariables,
  response: RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestPrependComment3Mutation$data,
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
    "name": "RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestPrependComment3Mutation",
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
    "name": "RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestPrependComment3Mutation",
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
            "handle": "prependNode",
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
    "cacheID": "963eea0848ace10b8c678ab104a99515",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestPrependComment3Mutation",
    "operationKind": "mutation",
    "text": "mutation RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestPrependComment3Mutation(\n  $input: CommentCreateInput\n) {\n  commentCreate(input: $input) {\n    comment {\n      id\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "e019fb25e10b78a75776d607d84a9677";
}

module.exports = ((node/*: any*/)/*: Mutation<
  RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestPrependComment3Mutation$variables,
  RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestPrependComment3Mutation$data,
>*/);
