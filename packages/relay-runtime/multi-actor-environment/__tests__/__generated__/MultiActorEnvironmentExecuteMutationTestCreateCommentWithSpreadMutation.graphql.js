/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<4104dd777b4ec738d5ca1db2650521c2>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Mutation } from 'relay-runtime';
type MultiActorEnvironmentExecuteMutationTestCommentFragment$fragmentType = any;
export type CommentCreateInput = {|
  feedback?: ?CommentfeedbackFeedback,
  feedbackId?: ?string,
|};
export type CommentfeedbackFeedback = {|
  comment?: ?FeedbackcommentComment,
|};
export type FeedbackcommentComment = {|
  feedback?: ?CommentfeedbackFeedback,
|};
export type MultiActorEnvironmentExecuteMutationTestCreateCommentWithSpreadMutation$variables = {|
  input: CommentCreateInput,
|};
export type MultiActorEnvironmentExecuteMutationTestCreateCommentWithSpreadMutation$data = {|
  +commentCreate: ?{|
    +comment: ?{|
      +$fragmentSpreads: MultiActorEnvironmentExecuteMutationTestCommentFragment$fragmentType,
    |},
  |},
|};
export type MultiActorEnvironmentExecuteMutationTestCreateCommentWithSpreadMutation = {|
  response: MultiActorEnvironmentExecuteMutationTestCreateCommentWithSpreadMutation$data,
  variables: MultiActorEnvironmentExecuteMutationTestCreateCommentWithSpreadMutation$variables,
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
    "name": "MultiActorEnvironmentExecuteMutationTestCreateCommentWithSpreadMutation",
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
                "name": "MultiActorEnvironmentExecuteMutationTestCommentFragment"
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
    "name": "MultiActorEnvironmentExecuteMutationTestCreateCommentWithSpreadMutation",
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
    "cacheID": "181ad9e48405e81a50c16aa97b3ae219",
    "id": null,
    "metadata": {},
    "name": "MultiActorEnvironmentExecuteMutationTestCreateCommentWithSpreadMutation",
    "operationKind": "mutation",
    "text": "mutation MultiActorEnvironmentExecuteMutationTestCreateCommentWithSpreadMutation(\n  $input: CommentCreateInput!\n) {\n  commentCreate(input: $input) {\n    comment {\n      ...MultiActorEnvironmentExecuteMutationTestCommentFragment\n      id\n    }\n  }\n}\n\nfragment MultiActorEnvironmentExecuteMutationTestCommentFragment on Comment {\n  id\n  body {\n    text\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "8b1a1a620a023c1d33529555155512e7";
}

module.exports = ((node/*: any*/)/*: Mutation<
  MultiActorEnvironmentExecuteMutationTestCreateCommentWithSpreadMutation$variables,
  MultiActorEnvironmentExecuteMutationTestCreateCommentWithSpreadMutation$data,
>*/);
