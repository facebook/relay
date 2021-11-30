/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<e4b446837e33617023241bf2bf2070bc>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, GraphQLSubscription } from 'relay-runtime';
type RelayModernEnvironmentExecuteSubscriptionWithDeferTestCommentFragment$fragmentType = any;
export type CommentCreateSubscriptionInput = {|
  clientSubscriptionId?: ?string,
  feedbackId?: ?string,
  text?: ?string,
|};
export type RelayModernEnvironmentExecuteSubscriptionWithDeferTestCommentCreateSubscription$variables = {|
  input: CommentCreateSubscriptionInput,
|};
export type RelayModernEnvironmentExecuteSubscriptionWithDeferTestCommentCreateSubscriptionVariables = RelayModernEnvironmentExecuteSubscriptionWithDeferTestCommentCreateSubscription$variables;
export type RelayModernEnvironmentExecuteSubscriptionWithDeferTestCommentCreateSubscription$data = {|
  +commentCreateSubscribe: ?{|
    +comment: ?{|
      +id: string,
      +$fragmentSpreads: RelayModernEnvironmentExecuteSubscriptionWithDeferTestCommentFragment$fragmentType,
    |},
  |},
|};
export type RelayModernEnvironmentExecuteSubscriptionWithDeferTestCommentCreateSubscriptionResponse = RelayModernEnvironmentExecuteSubscriptionWithDeferTestCommentCreateSubscription$data;
export type RelayModernEnvironmentExecuteSubscriptionWithDeferTestCommentCreateSubscription = {|
  variables: RelayModernEnvironmentExecuteSubscriptionWithDeferTestCommentCreateSubscriptionVariables,
  response: RelayModernEnvironmentExecuteSubscriptionWithDeferTestCommentCreateSubscription$data,
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
    "name": "RelayModernEnvironmentExecuteSubscriptionWithDeferTestCommentCreateSubscription",
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
            "concreteType": "Comment",
            "kind": "LinkedField",
            "name": "comment",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              {
                "kind": "Defer",
                "selections": [
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "RelayModernEnvironmentExecuteSubscriptionWithDeferTestCommentFragment"
                  }
                ]
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
    "name": "RelayModernEnvironmentExecuteSubscriptionWithDeferTestCommentCreateSubscription",
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
            "concreteType": "Comment",
            "kind": "LinkedField",
            "name": "comment",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              {
                "if": null,
                "kind": "Defer",
                "label": "RelayModernEnvironmentExecuteSubscriptionWithDeferTestCommentCreateSubscription$defer$RelayModernEnvironmentExecuteSubscriptionWithDeferTestCommentFragment",
                "selections": [
                  (v2/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": null,
                    "kind": "LinkedField",
                    "name": "actor",
                    "plural": false,
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
    "cacheID": "cc5d5a7b7cc03e0dc187517d56f6835d",
    "id": null,
    "metadata": {
      "subscriptionName": "commentCreateSubscribe"
    },
    "name": "RelayModernEnvironmentExecuteSubscriptionWithDeferTestCommentCreateSubscription",
    "operationKind": "subscription",
    "text": "subscription RelayModernEnvironmentExecuteSubscriptionWithDeferTestCommentCreateSubscription(\n  $input: CommentCreateSubscriptionInput!\n) {\n  commentCreateSubscribe(input: $input) {\n    comment {\n      id\n      ...RelayModernEnvironmentExecuteSubscriptionWithDeferTestCommentFragment @defer(label: \"RelayModernEnvironmentExecuteSubscriptionWithDeferTestCommentCreateSubscription$defer$RelayModernEnvironmentExecuteSubscriptionWithDeferTestCommentFragment\")\n    }\n  }\n}\n\nfragment RelayModernEnvironmentExecuteSubscriptionWithDeferTestCommentFragment on Comment {\n  id\n  actor {\n    __typename\n    name\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "a073626b1c5a53d43db57b61c0e02d57";
}

module.exports = ((node/*: any*/)/*: GraphQLSubscription<
  RelayModernEnvironmentExecuteSubscriptionWithDeferTestCommentCreateSubscription$variables,
  RelayModernEnvironmentExecuteSubscriptionWithDeferTestCommentCreateSubscription$data,
>*/);
