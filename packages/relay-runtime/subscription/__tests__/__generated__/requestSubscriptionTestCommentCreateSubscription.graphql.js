/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<6ddd39a561f8e102338cd114132e528a>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, GraphQLSubscription } from 'relay-runtime';
export type CommentCreateSubscriptionInput = {|
  clientSubscriptionId?: ?string,
  feedbackId?: ?string,
  text?: ?string,
|};
export type requestSubscriptionTestCommentCreateSubscription$variables = {|
  input?: ?CommentCreateSubscriptionInput,
|};
export type requestSubscriptionTestCommentCreateSubscriptionVariables = requestSubscriptionTestCommentCreateSubscription$variables;
export type requestSubscriptionTestCommentCreateSubscription$data = {|
  +commentCreateSubscribe: ?{|
    +feedbackCommentEdge: ?{|
      +node: ?{|
        +id: string,
        +body: ?{|
          +text: ?string,
        |},
      |},
    |},
  |},
|};
export type requestSubscriptionTestCommentCreateSubscriptionResponse = requestSubscriptionTestCommentCreateSubscription$data;
export type requestSubscriptionTestCommentCreateSubscription = {|
  variables: requestSubscriptionTestCommentCreateSubscriptionVariables,
  response: requestSubscriptionTestCommentCreateSubscription$data,
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
    "name": "commentCreateSubscribe",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "CommentsEdge",
        "kind": "LinkedField",
        "name": "feedbackCommentEdge",
        "plural": false,
        "selections": [
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
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "requestSubscriptionTestCommentCreateSubscription",
    "selections": (v1/*: any*/),
    "type": "Subscription",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "requestSubscriptionTestCommentCreateSubscription",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "69ed95f4ec4971c57ef2b015b07ffeb0",
    "id": null,
    "metadata": {
      "subscriptionName": "commentCreateSubscribe"
    },
    "name": "requestSubscriptionTestCommentCreateSubscription",
    "operationKind": "subscription",
    "text": "subscription requestSubscriptionTestCommentCreateSubscription(\n  $input: CommentCreateSubscriptionInput\n) {\n  commentCreateSubscribe(input: $input) {\n    feedbackCommentEdge {\n      node {\n        id\n        body {\n          text\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "7d9ee99d1116caeaecdf85285ba0c2f7";
}

module.exports = ((node/*: any*/)/*: GraphQLSubscription<
  requestSubscriptionTestCommentCreateSubscription$variables,
  requestSubscriptionTestCommentCreateSubscription$data,
>*/);
