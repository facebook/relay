/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<0d9434afe84db06bfba4120de469fe1f>>
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
export type requestSubscriptionTest1CommentCreateSubscription$variables = {|
  input?: ?CommentCreateSubscriptionInput,
|};
export type requestSubscriptionTest1CommentCreateSubscriptionVariables = requestSubscriptionTest1CommentCreateSubscription$variables;
export type requestSubscriptionTest1CommentCreateSubscription$data = {|
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
export type requestSubscriptionTest1CommentCreateSubscriptionResponse = requestSubscriptionTest1CommentCreateSubscription$data;
export type requestSubscriptionTest1CommentCreateSubscription = {|
  variables: requestSubscriptionTest1CommentCreateSubscriptionVariables,
  response: requestSubscriptionTest1CommentCreateSubscription$data,
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
    "name": "requestSubscriptionTest1CommentCreateSubscription",
    "selections": (v1/*: any*/),
    "type": "Subscription",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "requestSubscriptionTest1CommentCreateSubscription",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "a1671b3a14cbfbc84cfbf4a5b5f2fd89",
    "id": null,
    "metadata": {
      "subscriptionName": "commentCreateSubscribe"
    },
    "name": "requestSubscriptionTest1CommentCreateSubscription",
    "operationKind": "subscription",
    "text": "subscription requestSubscriptionTest1CommentCreateSubscription(\n  $input: CommentCreateSubscriptionInput\n) {\n  commentCreateSubscribe(input: $input) {\n    feedbackCommentEdge {\n      node {\n        id\n        body {\n          text\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "c3126efbf06bf76d4074616bcaa9bd4a";
}

module.exports = ((node/*: any*/)/*: GraphQLSubscription<
  requestSubscriptionTest1CommentCreateSubscription$variables,
  requestSubscriptionTest1CommentCreateSubscription$data,
>*/);
