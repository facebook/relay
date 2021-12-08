/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<a5babe5d9c213345f37c253742726d02>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Mutation } from 'relay-runtime';
export type ActorNameChangeInput = {|
  clientMutationId?: ?string,
  newName?: ?string,
|};
export type validateMutationTest2ChangeNameMutation$variables = {|
  input: ActorNameChangeInput,
|};
export type validateMutationTest2ChangeNameMutationVariables = validateMutationTest2ChangeNameMutation$variables;
export type validateMutationTest2ChangeNameMutation$data = {|
  +actorNameChange: ?{|
    +actor: ?{|
      +name: ?string,
    |},
  |},
|};
export type validateMutationTest2ChangeNameMutationResponse = validateMutationTest2ChangeNameMutation$data;
export type validateMutationTest2ChangeNameMutation = {|
  variables: validateMutationTest2ChangeNameMutationVariables,
  response: validateMutationTest2ChangeNameMutation$data,
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
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "validateMutationTest2ChangeNameMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "ActorNameChangePayload",
        "kind": "LinkedField",
        "name": "actorNameChange",
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
    "name": "validateMutationTest2ChangeNameMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "ActorNameChangePayload",
        "kind": "LinkedField",
        "name": "actorNameChange",
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
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "__typename",
                "storageKey": null
              },
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
    "cacheID": "2d953f7584501927922c57165679b5e3",
    "id": null,
    "metadata": {},
    "name": "validateMutationTest2ChangeNameMutation",
    "operationKind": "mutation",
    "text": "mutation validateMutationTest2ChangeNameMutation(\n  $input: ActorNameChangeInput!\n) {\n  actorNameChange(input: $input) {\n    actor {\n      __typename\n      name\n      id\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "b253eaee773f43048515e1ded4ee72aa";
}

module.exports = ((node/*: any*/)/*: Mutation<
  validateMutationTest2ChangeNameMutation$variables,
  validateMutationTest2ChangeNameMutation$data,
>*/);
