/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<a3c90da813da886f475e0c533eaebf26>>
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
export type RelayMockEnvironmentWithComponentsTestDisruptiveSuccessMutation$variables = {|
  input?: ?FeedbackLikeInput,
|};
export type RelayMockEnvironmentWithComponentsTestDisruptiveSuccessMutation$data = {|
  +feedbackLike: ?{|
    +feedback: ?{|
      +doesViewerLike: ?boolean,
      +id: string,
    |},
  |},
|};
export type RelayMockEnvironmentWithComponentsTestDisruptiveSuccessMutation = {|
  response: RelayMockEnvironmentWithComponentsTestDisruptiveSuccessMutation$data,
  variables: RelayMockEnvironmentWithComponentsTestDisruptiveSuccessMutation$variables,
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
            "kind": "ScalarField",
            "name": "doesViewerLike",
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
    "name": "RelayMockEnvironmentWithComponentsTestDisruptiveSuccessMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RelayMockEnvironmentWithComponentsTestDisruptiveSuccessMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "e784d3cd9b2e3a60a06d2baae1fd1468",
    "id": null,
    "metadata": {},
    "name": "RelayMockEnvironmentWithComponentsTestDisruptiveSuccessMutation",
    "operationKind": "mutation",
    "text": "mutation RelayMockEnvironmentWithComponentsTestDisruptiveSuccessMutation(\n  $input: FeedbackLikeInput\n) {\n  feedbackLike(input: $input) {\n    feedback {\n      id\n      doesViewerLike\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "0673467bdc3067b482da4f9b0f971cf1";
}

module.exports = ((node/*: any*/)/*: Mutation<
  RelayMockEnvironmentWithComponentsTestDisruptiveSuccessMutation$variables,
  RelayMockEnvironmentWithComponentsTestDisruptiveSuccessMutation$data,
>*/);
