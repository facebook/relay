/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<f208de4b31ca1b5d18d0d6cb4521f3d3>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
export type FeedbackLikeInput = {|
  clientMutationId?: ?string,
  feedbackId?: ?string,
|};
export type RelayMockEnvironmentWithComponentsTestRemarkableFixSubscriptionVariables = {|
  input?: ?FeedbackLikeInput,
|};
export type RelayMockEnvironmentWithComponentsTestRemarkableFixSubscriptionResponse = {|
  +feedbackLikeSubscribe: ?{|
    +feedback: ?{|
      +id: string,
      +doesViewerLike: ?boolean,
    |},
  |},
|};
export type RelayMockEnvironmentWithComponentsTestRemarkableFixSubscription = {|
  variables: RelayMockEnvironmentWithComponentsTestRemarkableFixSubscriptionVariables,
  response: RelayMockEnvironmentWithComponentsTestRemarkableFixSubscriptionResponse,
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
    "name": "feedbackLikeSubscribe",
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
    "name": "RelayMockEnvironmentWithComponentsTestRemarkableFixSubscription",
    "selections": (v1/*: any*/),
    "type": "Subscription",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RelayMockEnvironmentWithComponentsTestRemarkableFixSubscription",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "c8544e6b2672010acbe98aa4c507fb30",
    "id": null,
    "metadata": {
      "subscriptionName": "feedbackLikeSubscribe"
    },
    "name": "RelayMockEnvironmentWithComponentsTestRemarkableFixSubscription",
    "operationKind": "subscription",
    "text": "subscription RelayMockEnvironmentWithComponentsTestRemarkableFixSubscription(\n  $input: FeedbackLikeInput\n) {\n  feedbackLikeSubscribe(input: $input) {\n    feedback {\n      id\n      doesViewerLike\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "682950a31d9df2be2d3759baf5d0e9fc";
}

module.exports = node;
