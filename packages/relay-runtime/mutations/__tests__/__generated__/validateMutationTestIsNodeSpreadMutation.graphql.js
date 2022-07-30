/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<76451b3babcc9dd2be65c42e5cd1fc5d>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Mutation } from 'relay-runtime';
type validateMutationTestNodeFragement$fragmentType = any;
export type FeedbackLikeInput = {|
  feedbackId?: ?string,
|};
export type validateMutationTestIsNodeSpreadMutation$variables = {|
  input?: ?FeedbackLikeInput,
|};
export type validateMutationTestIsNodeSpreadMutation$data = {|
  +feedbackLike: ?{|
    +feedback: ?{|
      +$fragmentSpreads: validateMutationTestNodeFragement$fragmentType,
    |},
  |},
|};
export type validateMutationTestIsNodeSpreadMutation$rawResponse = {|
  +feedbackLike: ?{|
    +feedback: ?{|
      +__isNode: "Feedback",
      +id: string,
      +name: ?string,
    |},
  |},
|};
export type validateMutationTestIsNodeSpreadMutation = {|
  rawResponse: validateMutationTestIsNodeSpreadMutation$rawResponse,
  response: validateMutationTestIsNodeSpreadMutation$data,
  variables: validateMutationTestIsNodeSpreadMutation$variables,
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
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "validateMutationTestIsNodeSpreadMutation",
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
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "validateMutationTestNodeFragement"
              }
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
    "name": "validateMutationTestIsNodeSpreadMutation",
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
              {
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
              },
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
    "cacheID": "3c3acea3829fe7871128e54c83f3bcc4",
    "id": null,
    "metadata": {},
    "name": "validateMutationTestIsNodeSpreadMutation",
    "operationKind": "mutation",
    "text": "mutation validateMutationTestIsNodeSpreadMutation(\n  $input: FeedbackLikeInput\n) {\n  feedbackLike(input: $input) {\n    feedback {\n      ...validateMutationTestNodeFragement\n      id\n    }\n  }\n}\n\nfragment validateMutationTestNodeFragement on Node {\n  __isNode: __typename\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "8d533cf7894c4cce1eb6b30d79549d19";
}

module.exports = ((node/*: any*/)/*: Mutation<
  validateMutationTestIsNodeSpreadMutation$variables,
  validateMutationTestIsNodeSpreadMutation$data,
  validateMutationTestIsNodeSpreadMutation$rawResponse,
>*/);
