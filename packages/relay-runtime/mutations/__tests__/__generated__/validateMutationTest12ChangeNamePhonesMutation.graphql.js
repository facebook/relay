/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<5d2a29c37140e1c5d6a90f21c8e9a872>>
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
export type validateMutationTest12ChangeNamePhonesMutation$variables = {|
  input: ActorNameChangeInput,
|};
export type validateMutationTest12ChangeNamePhonesMutationVariables = validateMutationTest12ChangeNamePhonesMutation$variables;
export type validateMutationTest12ChangeNamePhonesMutation$data = {|
  +actorNameChange: ?{|
    +actor: ?{|
      +allPhones: ?$ReadOnlyArray<?{|
        +isVerified: ?boolean,
      |}>,
    |},
  |},
|};
export type validateMutationTest12ChangeNamePhonesMutationResponse = validateMutationTest12ChangeNamePhonesMutation$data;
export type validateMutationTest12ChangeNamePhonesMutation = {|
  variables: validateMutationTest12ChangeNamePhonesMutationVariables,
  response: validateMutationTest12ChangeNamePhonesMutation$data,
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
  "concreteType": "Phone",
  "kind": "LinkedField",
  "name": "allPhones",
  "plural": true,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "isVerified",
      "storageKey": null
    }
  ],
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "validateMutationTest12ChangeNamePhonesMutation",
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
    "name": "validateMutationTest12ChangeNamePhonesMutation",
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
    "cacheID": "8e08c14a11a7bb45615e6691a14845d6",
    "id": null,
    "metadata": {},
    "name": "validateMutationTest12ChangeNamePhonesMutation",
    "operationKind": "mutation",
    "text": "mutation validateMutationTest12ChangeNamePhonesMutation(\n  $input: ActorNameChangeInput!\n) {\n  actorNameChange(input: $input) {\n    actor {\n      __typename\n      allPhones {\n        isVerified\n      }\n      id\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "e8f3d78c3a2e9ff7c989679f65d57979";
}

module.exports = ((node/*: any*/)/*: Mutation<
  validateMutationTest12ChangeNamePhonesMutation$variables,
  validateMutationTest12ChangeNamePhonesMutation$data,
>*/);
