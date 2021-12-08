/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<5237c19a8e2fdf9a86a8d06df7803615>>
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
export type useSubscriptionTestCommentCreateSubscription$variables = {|
  input?: ?CommentCreateSubscriptionInput,
|};
export type useSubscriptionTestCommentCreateSubscriptionVariables = useSubscriptionTestCommentCreateSubscription$variables;
export type useSubscriptionTestCommentCreateSubscription$data = {|
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
export type useSubscriptionTestCommentCreateSubscriptionResponse = useSubscriptionTestCommentCreateSubscription$data;
export type useSubscriptionTestCommentCreateSubscription = {|
  variables: useSubscriptionTestCommentCreateSubscriptionVariables,
  response: useSubscriptionTestCommentCreateSubscription$data,
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
    "name": "useSubscriptionTestCommentCreateSubscription",
    "selections": (v1/*: any*/),
    "type": "Subscription",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "useSubscriptionTestCommentCreateSubscription",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "9825c984d20af05ca6d3b97f00793d02",
    "id": null,
    "metadata": {
      "subscriptionName": "commentCreateSubscribe"
    },
    "name": "useSubscriptionTestCommentCreateSubscription",
    "operationKind": "subscription",
    "text": "subscription useSubscriptionTestCommentCreateSubscription(\n  $input: CommentCreateSubscriptionInput\n) {\n  commentCreateSubscribe(input: $input) {\n    feedbackCommentEdge {\n      node {\n        id\n        body {\n          text\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "09f7f93828042d5022df685ced707645";
}

module.exports = ((node/*: any*/)/*: GraphQLSubscription<
  useSubscriptionTestCommentCreateSubscription$variables,
  useSubscriptionTestCommentCreateSubscription$data,
>*/);
