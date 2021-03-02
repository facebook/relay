/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<2c6df9358fa04ee48d85fe8324fbd01a>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @ReactFlightServerDependency FlightComponent.server

/*::
import type { ConcreteRequest } from 'relay-runtime';
export type StoryUpdateInput = {|
  clientMutationId?: ?string,
  body?: ?InputText,
|};
export type InputText = {|
  text?: ?string,
  ranges?: ?$ReadOnlyArray<?string>,
|};
export type validateMutationTestFlightMutationVariables = {|
  input: StoryUpdateInput,
  count: number,
|};
export type validateMutationTestFlightMutationResponse = {|
  +storyUpdate: ?{|
    +story: ?{|
      +id: string,
      +body: ?{|
        +text: ?string,
      |},
      +flightComponentValidateMutation: ?any,
    |},
  |},
|};
export type validateMutationTestFlightMutation = {|
  variables: validateMutationTestFlightMutationVariables,
  response: validateMutationTestFlightMutationResponse,
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
            "alias": "flightComponentValidateMutation",
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
    "name": "validateMutationTestFlightMutation",
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
    "name": "validateMutationTestFlightMutation",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "118f5bcd280fc4045732b0d197c1e4b6",
    "id": null,
    "metadata": {},
    "name": "validateMutationTestFlightMutation",
    "operationKind": "mutation",
    "text": "mutation validateMutationTestFlightMutation(\n  $input: StoryUpdateInput!\n  $count: Int!\n) {\n  storyUpdate(input: $input) {\n    story {\n      id\n      body {\n        text\n      }\n      flightComponentValidateMutation: flight(component: \"FlightComponent.server\", props: {condition: true, count: $count})\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "c2572b38ee685a5a6aabe18d3b11f56b";
}

module.exports = node;
