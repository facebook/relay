/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<a9a1ff5942df1609d3252d88887750d9>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @dataDrivenDependency requestSubscriptionTestSubscription.commentCreateSubscribe.comment.actor.nameRenderer {"branches":{"PlainUserNameRenderer":{"component":"PlainUserNameRenderer.react","fragment":"requestSubscriptionTestPlainUserNameRenderer_name$normalization.graphql"}},"plural":false}

/*::
import type { ConcreteRequest, GraphQLSubscription } from 'relay-runtime';
type requestSubscriptionTestPlainUserNameRenderer_name$fragmentType = any;
export type CommentCreateSubscriptionInput = {|
  clientSubscriptionId?: ?string,
  feedbackId?: ?string,
  text?: ?string,
|};
export type requestSubscriptionTestSubscription$variables = {|
  input: CommentCreateSubscriptionInput,
|};
export type requestSubscriptionTestSubscriptionVariables = requestSubscriptionTestSubscription$variables;
export type requestSubscriptionTestSubscription$data = {|
  +commentCreateSubscribe: ?{|
    +comment: ?{|
      +actor: ?{|
        +name: ?string,
        +nameRenderer: ?{|
          +__fragmentPropName?: ?string,
          +__module_component?: ?string,
          +$fragmentSpreads: requestSubscriptionTestPlainUserNameRenderer_name$fragmentType,
        |},
      |},
    |},
  |},
|};
export type requestSubscriptionTestSubscriptionResponse = requestSubscriptionTestSubscription$data;
export type requestSubscriptionTestSubscription = {|
  variables: requestSubscriptionTestSubscriptionVariables,
  response: requestSubscriptionTestSubscription$data,
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
  "name": "name",
  "storageKey": null
},
v3 = [
  {
    "kind": "Literal",
    "name": "supported",
    "value": [
      "PlainUserNameRenderer"
    ]
  }
],
v4 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "args": null,
      "documentName": "requestSubscriptionTestSubscription",
      "fragmentName": "requestSubscriptionTestPlainUserNameRenderer_name",
      "fragmentPropName": "name",
      "kind": "ModuleImport"
    }
  ],
  "type": "PlainUserNameRenderer",
  "abstractKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v6 = {
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
    "name": "requestSubscriptionTestSubscription",
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
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "actor",
                "plural": false,
                "selections": [
                  (v2/*: any*/),
                  {
                    "alias": null,
                    "args": (v3/*: any*/),
                    "concreteType": null,
                    "kind": "LinkedField",
                    "name": "nameRenderer",
                    "plural": false,
                    "selections": [
                      (v4/*: any*/)
                    ],
                    "storageKey": "nameRenderer(supported:[\"PlainUserNameRenderer\"])"
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
    "type": "Subscription",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "requestSubscriptionTestSubscription",
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
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "actor",
                "plural": false,
                "selections": [
                  (v5/*: any*/),
                  (v2/*: any*/),
                  {
                    "alias": null,
                    "args": (v3/*: any*/),
                    "concreteType": null,
                    "kind": "LinkedField",
                    "name": "nameRenderer",
                    "plural": false,
                    "selections": [
                      (v5/*: any*/),
                      (v4/*: any*/)
                    ],
                    "storageKey": "nameRenderer(supported:[\"PlainUserNameRenderer\"])"
                  },
                  (v6/*: any*/)
                ],
                "storageKey": null
              },
              (v6/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "c70373f17edf13d0b0d8b3f24c5fb33f",
    "id": null,
    "metadata": {
      "subscriptionName": "commentCreateSubscribe"
    },
    "name": "requestSubscriptionTestSubscription",
    "operationKind": "subscription",
    "text": "subscription requestSubscriptionTestSubscription(\n  $input: CommentCreateSubscriptionInput!\n) {\n  commentCreateSubscribe(input: $input) {\n    comment {\n      actor {\n        __typename\n        name\n        nameRenderer(supported: [\"PlainUserNameRenderer\"]) {\n          __typename\n          ... on PlainUserNameRenderer {\n            ...requestSubscriptionTestPlainUserNameRenderer_name\n            __module_operation_requestSubscriptionTestSubscription: js(module: \"requestSubscriptionTestPlainUserNameRenderer_name$normalization.graphql\", id: \"requestSubscriptionTestSubscription.commentCreateSubscribe.comment.actor.nameRenderer\")\n            __module_component_requestSubscriptionTestSubscription: js(module: \"PlainUserNameRenderer.react\", id: \"requestSubscriptionTestSubscription.commentCreateSubscribe.comment.actor.nameRenderer\")\n          }\n        }\n        id\n      }\n      id\n    }\n  }\n}\n\nfragment requestSubscriptionTestPlainUserNameRenderer_name on PlainUserNameRenderer {\n  plaintext\n  data {\n    text\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "311e059536555ff9d7a020724eea959c";
}

module.exports = ((node/*: any*/)/*: GraphQLSubscription<
  requestSubscriptionTestSubscription$variables,
  requestSubscriptionTestSubscription$data,
>*/);
