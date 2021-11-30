/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<1a6d0869097ca8604496a418bbbb5c35>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Mutation } from 'relay-runtime';
type RelayModernEnvironmentApplyMutationTestFragment$fragmentType = any;
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
export type RelayModernEnvironmentApplyMutationTest1Mutation$variables = {|
  input: CommentCreateInput,
|};
export type RelayModernEnvironmentApplyMutationTest1MutationVariables = RelayModernEnvironmentApplyMutationTest1Mutation$variables;
export type RelayModernEnvironmentApplyMutationTest1Mutation$data = {|
  +commentCreate: ?{|
    +comment: ?{|
      +$fragmentSpreads: RelayModernEnvironmentApplyMutationTestFragment$fragmentType,
    |},
  |},
|};
export type RelayModernEnvironmentApplyMutationTest1MutationResponse = RelayModernEnvironmentApplyMutationTest1Mutation$data;
export type RelayModernEnvironmentApplyMutationTest1Mutation = {|
  variables: RelayModernEnvironmentApplyMutationTest1MutationVariables,
  response: RelayModernEnvironmentApplyMutationTest1Mutation$data,
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
    "kind": "Variable",
    "name": "input",
    "variableName": "input"
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentApplyMutationTest1Mutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
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
                "args": null,
                "kind": "FragmentSpread",
                "name": "RelayModernEnvironmentApplyMutationTestFragment"
              }
            ],
            "storageKey": null
          }
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
    "name": "RelayModernEnvironmentApplyMutationTest1Mutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
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
    ]
  },
  "params": {
    "cacheID": "91894c0eef9f8835af6e9e2592409903",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentApplyMutationTest1Mutation",
    "operationKind": "mutation",
    "text": "mutation RelayModernEnvironmentApplyMutationTest1Mutation(\n  $input: CommentCreateInput!\n) {\n  commentCreate(input: $input) {\n    comment {\n      ...RelayModernEnvironmentApplyMutationTestFragment\n      id\n    }\n  }\n}\n\nfragment RelayModernEnvironmentApplyMutationTestFragment on Comment {\n  id\n  body {\n    text\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "132d201099718ff26a1198c441d73c0a";
}

module.exports = ((node/*: any*/)/*: Mutation<
  RelayModernEnvironmentApplyMutationTest1Mutation$variables,
  RelayModernEnvironmentApplyMutationTest1Mutation$data,
>*/);
