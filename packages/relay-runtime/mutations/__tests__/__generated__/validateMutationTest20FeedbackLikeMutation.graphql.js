/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<21d5ce041289e962f4ec8ab6962f8829>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Mutation } from 'relay-runtime';
export type FeedbackLikeInput = {|
  feedbackId?: ?string,
|};
export type validateMutationTest20FeedbackLikeMutation$variables = {|
  input?: ?FeedbackLikeInput,
|};
export type validateMutationTest20FeedbackLikeMutation$data = {|
  +feedbackLike: ?{|
    +feedback: ?{|
      +doesViewerLike: ?boolean,
      +isSavingLike: ?boolean,
    |},
  |},
|};
export type validateMutationTest20FeedbackLikeMutation = {|
  response: validateMutationTest20FeedbackLikeMutation$data,
  variables: validateMutationTest20FeedbackLikeMutation$variables,
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
  "name": "doesViewerLike",
  "storageKey": null
},
v3 = {
  "kind": "ClientExtension",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "isSavingLike",
      "storageKey": null
    }
  ]
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "validateMutationTest20FeedbackLikeMutation",
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
              (v3/*: any*/)
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
    "name": "validateMutationTest20FeedbackLikeMutation",
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
              },
              (v3/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "f6d1e6dfdcd4525b36f2b74bc97412f3",
    "id": null,
    "metadata": {},
    "name": "validateMutationTest20FeedbackLikeMutation",
    "operationKind": "mutation",
    "text": "mutation validateMutationTest20FeedbackLikeMutation(\n  $input: FeedbackLikeInput\n) {\n  feedbackLike(input: $input) {\n    feedback {\n      doesViewerLike\n      id\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "705c710e447f0815be52c8e723e62d35";
}

module.exports = ((node/*: any*/)/*: Mutation<
  validateMutationTest20FeedbackLikeMutation$variables,
  validateMutationTest20FeedbackLikeMutation$data,
>*/);
