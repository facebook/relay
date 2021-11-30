/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<8e3c43a3ea4c5671d911f605e11430ab>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, GraphQLSubscription } from 'relay-runtime';
type RelayModernEnvironmentExecuteSubscriptionWithStreamTestFeedbackFragment$fragmentType = any;
export type CommentCreateSubscriptionInput = {|
  clientSubscriptionId?: ?string,
  feedbackId?: ?string,
  text?: ?string,
|};
export type RelayModernEnvironmentExecuteSubscriptionWithStreamTestCommentCreateSubscription$variables = {|
  input: CommentCreateSubscriptionInput,
|};
export type RelayModernEnvironmentExecuteSubscriptionWithStreamTestCommentCreateSubscriptionVariables = RelayModernEnvironmentExecuteSubscriptionWithStreamTestCommentCreateSubscription$variables;
export type RelayModernEnvironmentExecuteSubscriptionWithStreamTestCommentCreateSubscription$data = {|
  +commentCreateSubscribe: ?{|
    +feedback: ?{|
      +$fragmentSpreads: RelayModernEnvironmentExecuteSubscriptionWithStreamTestFeedbackFragment$fragmentType,
    |},
  |},
|};
export type RelayModernEnvironmentExecuteSubscriptionWithStreamTestCommentCreateSubscriptionResponse = RelayModernEnvironmentExecuteSubscriptionWithStreamTestCommentCreateSubscription$data;
export type RelayModernEnvironmentExecuteSubscriptionWithStreamTestCommentCreateSubscription = {|
  variables: RelayModernEnvironmentExecuteSubscriptionWithStreamTestCommentCreateSubscriptionVariables,
  response: RelayModernEnvironmentExecuteSubscriptionWithStreamTestCommentCreateSubscription$data,
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
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentExecuteSubscriptionWithStreamTestCommentCreateSubscription",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "CommentCreateResponsePayload",
        "kind": "LinkedField",
        "name": "commentCreateSubscribe",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "Feedback",
            "kind": "LinkedField",
            "name": "feedback",
            "plural": false,
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "RelayModernEnvironmentExecuteSubscriptionWithStreamTestFeedbackFragment"
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Subscription",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RelayModernEnvironmentExecuteSubscriptionWithStreamTestCommentCreateSubscription",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "CommentCreateResponsePayload",
        "kind": "LinkedField",
        "name": "commentCreateSubscribe",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "Feedback",
            "kind": "LinkedField",
            "name": "feedback",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              {
                "if": null,
                "kind": "Stream",
                "label": "RelayModernEnvironmentExecuteSubscriptionWithStreamTestFeedbackFragment$stream$actors",
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": null,
                    "kind": "LinkedField",
                    "name": "actors",
                    "plural": true,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "__typename",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "name",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "filters": null,
                        "handle": "name_handler",
                        "key": "",
                        "kind": "ScalarHandle",
                        "name": "name"
                      },
                      (v2/*: any*/)
                    ],
                    "storageKey": null
                  }
                ]
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
    "cacheID": "c13dedba1d0c8b17a192b735d141de99",
    "id": null,
    "metadata": {
      "subscriptionName": "commentCreateSubscribe"
    },
    "name": "RelayModernEnvironmentExecuteSubscriptionWithStreamTestCommentCreateSubscription",
    "operationKind": "subscription",
    "text": "subscription RelayModernEnvironmentExecuteSubscriptionWithStreamTestCommentCreateSubscription(\n  $input: CommentCreateSubscriptionInput!\n) {\n  commentCreateSubscribe(input: $input) {\n    feedback {\n      ...RelayModernEnvironmentExecuteSubscriptionWithStreamTestFeedbackFragment\n      id\n    }\n  }\n}\n\nfragment RelayModernEnvironmentExecuteSubscriptionWithStreamTestFeedbackFragment on Feedback {\n  id\n  actors @stream(label: \"RelayModernEnvironmentExecuteSubscriptionWithStreamTestFeedbackFragment$stream$actors\", initial_count: 0) {\n    __typename\n    name\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "70d193c49c68d1cebe7967a31c1a0bcf";
}

module.exports = ((node/*: any*/)/*: GraphQLSubscription<
  RelayModernEnvironmentExecuteSubscriptionWithStreamTestCommentCreateSubscription$variables,
  RelayModernEnvironmentExecuteSubscriptionWithStreamTestCommentCreateSubscription$data,
>*/);
