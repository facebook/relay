/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<3fde0f6397bcdcd2522614d94fc51398>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @dataDrivenDependency validateMutationTest21FeedbackLikeGroovyMutation.feedbackLike.feedback {"branches":{"Feedback":{"component":"GroovyModule.react","fragment":"validateMutationTestGroovyFragment_groovygroovy$normalization.graphql"}},"plural":false}

/*::
import type { ConcreteRequest, Mutation } from 'relay-runtime';
type validateMutationTestGroovyFragment_groovygroovy$fragmentType = any;
export type FeedbackLikeInput = {|
  clientMutationId?: ?string,
  feedbackId?: ?string,
|};
export type validateMutationTest21FeedbackLikeGroovyMutation$variables = {|
  input?: ?FeedbackLikeInput,
|};
export type validateMutationTest21FeedbackLikeGroovyMutationVariables = validateMutationTest21FeedbackLikeGroovyMutation$variables;
export type validateMutationTest21FeedbackLikeGroovyMutation$data = {|
  +feedbackLike: ?{|
    +feedback: ?{|
      +__fragmentPropName: ?string,
      +__module_component: ?string,
      +$fragmentSpreads: validateMutationTestGroovyFragment_groovygroovy$fragmentType,
    |},
  |},
|};
export type validateMutationTest21FeedbackLikeGroovyMutationResponse = validateMutationTest21FeedbackLikeGroovyMutation$data;
export type validateMutationTest21FeedbackLikeGroovyMutation = {|
  variables: validateMutationTest21FeedbackLikeGroovyMutationVariables,
  response: validateMutationTest21FeedbackLikeGroovyMutation$data,
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
  "args": null,
  "documentName": "validateMutationTest21FeedbackLikeGroovyMutation",
  "fragmentName": "validateMutationTestGroovyFragment_groovygroovy",
  "fragmentPropName": "groovygroovy",
  "kind": "ModuleImport"
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "validateMutationTest21FeedbackLikeGroovyMutation",
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
    "name": "validateMutationTest21FeedbackLikeGroovyMutation",
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
    "cacheID": "db64282f517d26580d3d1a2c4001ff68",
    "id": null,
    "metadata": {},
    "name": "validateMutationTest21FeedbackLikeGroovyMutation",
    "operationKind": "mutation",
    "text": "mutation validateMutationTest21FeedbackLikeGroovyMutation(\n  $input: FeedbackLikeInput\n) {\n  feedbackLike(input: $input) {\n    feedback {\n      ...validateMutationTestGroovyFragment_groovygroovy\n      __module_operation_validateMutationTest21FeedbackLikeGroovyMutation: js(module: \"validateMutationTestGroovyFragment_groovygroovy$normalization.graphql\", id: \"validateMutationTest21FeedbackLikeGroovyMutation.feedbackLike.feedback\")\n      __module_component_validateMutationTest21FeedbackLikeGroovyMutation: js(module: \"GroovyModule.react\", id: \"validateMutationTest21FeedbackLikeGroovyMutation.feedbackLike.feedback\")\n      id\n    }\n  }\n}\n\nfragment validateMutationTestGroovyFragment_groovygroovy on Feedback {\n  doesViewerLike\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "1e3c3d5ff5319327113cae797b6e7f72";
}

module.exports = ((node/*: any*/)/*: Mutation<
  validateMutationTest21FeedbackLikeGroovyMutation$variables,
  validateMutationTest21FeedbackLikeGroovyMutation$data,
>*/);
