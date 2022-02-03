/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<fa6ddab580ea7942dce5cd2bb7165d64>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Mutation } from 'relay-runtime';
export type FeedbackLikeInput = {|
  clientMutationId?: ?string,
  feedbackId?: ?string,
|};
export type validateMutationTestIsNodeInlineFragmentMutation$variables = {|
  input?: ?FeedbackLikeInput,
|};
export type validateMutationTestIsNodeInlineFragmentMutationVariables = validateMutationTestIsNodeInlineFragmentMutation$variables;
export type validateMutationTestIsNodeInlineFragmentMutation$data = {|
  +feedbackLike: ?{|
    +feedback: ?{|
      +name?: ?string,
    |},
  |},
|};
export type validateMutationTestIsNodeInlineFragmentMutationResponse = validateMutationTestIsNodeInlineFragmentMutation$data;
export type validateMutationTestIsNodeInlineFragmentMutation$rawResponse = {|
  +feedbackLike: ?{|
    +feedback: ?{|
      +__isNode: "Feedback",
      +name: ?string,
      +id: string,
    |},
  |},
|};
export type validateMutationTestIsNodeInlineFragmentMutationRawResponse = validateMutationTestIsNodeInlineFragmentMutation$rawResponse;
export type validateMutationTestIsNodeInlineFragmentMutation = {|
  variables: validateMutationTestIsNodeInlineFragmentMutationVariables,
  response: validateMutationTestIsNodeInlineFragmentMutation$data,
  rawResponse: validateMutationTestIsNodeInlineFragmentMutation$rawResponse,
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
  "kind": "InlineFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    }
  ],
  "type": "Node",
  "abstractKey": "__isNode"
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "validateMutationTestIsNodeInlineFragmentMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "FeedbackLikeResponsePayload",
        "kind": "LinkedField",
        "name": "feedbackLike",
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
              (v2/*: any*/)
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
    "name": "validateMutationTestIsNodeInlineFragmentMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "FeedbackLikeResponsePayload",
        "kind": "LinkedField",
        "name": "feedbackLike",
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
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "id",
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
    "cacheID": "de64da0c338e46bf77aa7b6df8eafd9f",
    "id": null,
    "metadata": {},
    "name": "validateMutationTestIsNodeInlineFragmentMutation",
    "operationKind": "mutation",
    "text": "mutation validateMutationTestIsNodeInlineFragmentMutation(\n  $input: FeedbackLikeInput\n) {\n  feedbackLike(input: $input) {\n    feedback {\n      ... on Node {\n        __isNode: __typename\n        name\n      }\n      id\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "5c268338fe3276b5eec605fa563c73d3";
}

module.exports = ((node/*: any*/)/*: Mutation<
  validateMutationTestIsNodeInlineFragmentMutation$variables,
  validateMutationTestIsNodeInlineFragmentMutation$data,
  validateMutationTestIsNodeInlineFragmentMutation$rawResponse,
>*/);
