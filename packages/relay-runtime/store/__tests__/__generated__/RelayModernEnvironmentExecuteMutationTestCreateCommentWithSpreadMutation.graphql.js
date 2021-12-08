/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<8e82a5e3e9856859cc3517d36679f431>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Mutation } from 'relay-runtime';
type RelayModernEnvironmentExecuteMutationTestCommentFragment$fragmentType = any;
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
export type RelayModernEnvironmentExecuteMutationTestCreateCommentWithSpreadMutation$variables = {|
  input: CommentCreateInput,
|};
export type RelayModernEnvironmentExecuteMutationTestCreateCommentWithSpreadMutationVariables = RelayModernEnvironmentExecuteMutationTestCreateCommentWithSpreadMutation$variables;
export type RelayModernEnvironmentExecuteMutationTestCreateCommentWithSpreadMutation$data = {|
  +commentCreate: ?{|
    +comment: ?{|
      +$fragmentSpreads: RelayModernEnvironmentExecuteMutationTestCommentFragment$fragmentType,
    |},
  |},
|};
export type RelayModernEnvironmentExecuteMutationTestCreateCommentWithSpreadMutationResponse = RelayModernEnvironmentExecuteMutationTestCreateCommentWithSpreadMutation$data;
export type RelayModernEnvironmentExecuteMutationTestCreateCommentWithSpreadMutation = {|
  variables: RelayModernEnvironmentExecuteMutationTestCreateCommentWithSpreadMutationVariables,
  response: RelayModernEnvironmentExecuteMutationTestCreateCommentWithSpreadMutation$data,
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
    "name": "RelayModernEnvironmentExecuteMutationTestCreateCommentWithSpreadMutation",
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
                "name": "RelayModernEnvironmentExecuteMutationTestCommentFragment"
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
    "name": "RelayModernEnvironmentExecuteMutationTestCreateCommentWithSpreadMutation",
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
    "cacheID": "6ccb14f82ef456561f80346917649000",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentExecuteMutationTestCreateCommentWithSpreadMutation",
    "operationKind": "mutation",
    "text": "mutation RelayModernEnvironmentExecuteMutationTestCreateCommentWithSpreadMutation(\n  $input: CommentCreateInput!\n) {\n  commentCreate(input: $input) {\n    comment {\n      ...RelayModernEnvironmentExecuteMutationTestCommentFragment\n      id\n    }\n  }\n}\n\nfragment RelayModernEnvironmentExecuteMutationTestCommentFragment on Comment {\n  id\n  body {\n    text\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "8300454c95b302320001a42f871b20cc";
}

module.exports = ((node/*: any*/)/*: Mutation<
  RelayModernEnvironmentExecuteMutationTestCreateCommentWithSpreadMutation$variables,
  RelayModernEnvironmentExecuteMutationTestCreateCommentWithSpreadMutation$data,
>*/);
