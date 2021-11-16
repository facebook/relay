/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<cc93f0dd1c1f30b00d3cd2aed41e0e6a>>
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
export type validateMutationTest19FeedbackLikeMutation$variables = {|
  input?: ?FeedbackLikeInput,
|};
export type validateMutationTest19FeedbackLikeMutationVariables = validateMutationTest19FeedbackLikeMutation$variables;
export type validateMutationTest19FeedbackLikeMutation$data = {|
  +feedbackLike: ?{|
    +feedback: ?{|
      +doesViewerLike: ?boolean,
      +isSavingLike: ?boolean,
    |},
  |},
|};
export type validateMutationTest19FeedbackLikeMutationResponse = validateMutationTest19FeedbackLikeMutation$data;
export type validateMutationTest19FeedbackLikeMutation = {|
  variables: validateMutationTest19FeedbackLikeMutationVariables,
  response: validateMutationTest19FeedbackLikeMutation$data,
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
    "name": "validateMutationTest19FeedbackLikeMutation",
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
    "name": "validateMutationTest19FeedbackLikeMutation",
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
    "cacheID": "4c6943d8524be84ff1b4c3094778ca11",
    "id": null,
    "metadata": {},
    "name": "validateMutationTest19FeedbackLikeMutation",
    "operationKind": "mutation",
    "text": "mutation validateMutationTest19FeedbackLikeMutation(\n  $input: FeedbackLikeInput\n) {\n  feedbackLike(input: $input) {\n    feedback {\n      doesViewerLike\n      id\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "cb1650d795ec969789e398422323459a";
}

module.exports = ((node/*: any*/)/*: Mutation<
  validateMutationTest19FeedbackLikeMutation$variables,
  validateMutationTest19FeedbackLikeMutation$data,
>*/);
