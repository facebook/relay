/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<6459a47755d67db2c6954f1f42896334>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @ReactFlightServerDependency FlightComponent.server

/*::
import type { ConcreteRequest, Mutation } from 'relay-runtime';
export type StoryUpdateInput = {|
  clientMutationId?: ?string,
  body?: ?InputText,
|};
export type InputText = {|
  text?: ?string,
  ranges?: ?$ReadOnlyArray<?string>,
|};
export type RelayModernEnvironmentExecuteMutationWithFlightTest_UpdateStoryMutation$variables = {|
  input: StoryUpdateInput,
  count: number,
|};
export type RelayModernEnvironmentExecuteMutationWithFlightTest_UpdateStoryMutationVariables = RelayModernEnvironmentExecuteMutationWithFlightTest_UpdateStoryMutation$variables;
export type RelayModernEnvironmentExecuteMutationWithFlightTest_UpdateStoryMutation$data = {|
  +storyUpdate: ?{|
    +story: ?{|
      +id: string,
      +body: ?{|
        +text: ?string,
      |},
      +flightComponent: ?any,
    |},
  |},
|};
export type RelayModernEnvironmentExecuteMutationWithFlightTest_UpdateStoryMutationResponse = RelayModernEnvironmentExecuteMutationWithFlightTest_UpdateStoryMutation$data;
export type RelayModernEnvironmentExecuteMutationWithFlightTest_UpdateStoryMutation = {|
  variables: RelayModernEnvironmentExecuteMutationWithFlightTest_UpdateStoryMutationVariables,
  response: RelayModernEnvironmentExecuteMutationWithFlightTest_UpdateStoryMutation$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "count"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "input"
},
v2 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "StoryUpdateResponsePayload",
    "kind": "LinkedField",
    "name": "storyUpdate",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Story",
        "kind": "LinkedField",
        "name": "story",
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
          },
          {
            "alias": "flightComponent",
            "args": [
              {
                "kind": "Literal",
                "name": "component",
                "value": "FlightComponent.server"
              },
              {
                "fields": [
                  {
                    "kind": "Literal",
                    "name": "condition",
                    "value": true
                  },
                  {
                    "kind": "Variable",
                    "name": "count",
                    "variableName": "count"
                  },
                  {
                    "kind": "Literal",
                    "name": "id",
                    "value": "x"
                  }
                ],
                "kind": "ObjectValue",
                "name": "props"
              }
            ],
            "kind": "FlightField",
            "name": "flight",
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
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentExecuteMutationWithFlightTest_UpdateStoryMutation",
    "selections": (v2/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "RelayModernEnvironmentExecuteMutationWithFlightTest_UpdateStoryMutation",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "bc77fdcb1d93e6598f93a1f482af7052",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentExecuteMutationWithFlightTest_UpdateStoryMutation",
    "operationKind": "mutation",
    "text": "mutation RelayModernEnvironmentExecuteMutationWithFlightTest_UpdateStoryMutation(\n  $input: StoryUpdateInput!\n  $count: Int!\n) {\n  storyUpdate(input: $input) {\n    story {\n      id\n      body {\n        text\n      }\n      flightComponent: flight(component: \"FlightComponent.server\", props: {condition: true, count: $count, id: \"x\"})\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "3f3551ba1af651d056e6777df90ef1d4";
}

module.exports = ((node/*: any*/)/*: Mutation<
  RelayModernEnvironmentExecuteMutationWithFlightTest_UpdateStoryMutation$variables,
  RelayModernEnvironmentExecuteMutationWithFlightTest_UpdateStoryMutation$data,
>*/);
