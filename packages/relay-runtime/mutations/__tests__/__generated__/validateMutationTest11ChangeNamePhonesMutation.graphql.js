/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<29b10ef8d752b89f9738823c1c69bf39>>
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
export type validateMutationTest11ChangeNamePhonesMutation$variables = {|
  input: ActorNameChangeInput,
|};
export type validateMutationTest11ChangeNamePhonesMutationVariables = validateMutationTest11ChangeNamePhonesMutation$variables;
export type validateMutationTest11ChangeNamePhonesMutation$data = {|
  +actorNameChange: ?{|
    +actor: ?{|
      +allPhones: ?$ReadOnlyArray<?{|
        +isVerified: ?boolean,
      |}>,
    |},
  |},
|};
export type validateMutationTest11ChangeNamePhonesMutationResponse = validateMutationTest11ChangeNamePhonesMutation$data;
export type validateMutationTest11ChangeNamePhonesMutation = {|
  variables: validateMutationTest11ChangeNamePhonesMutationVariables,
  response: validateMutationTest11ChangeNamePhonesMutation$data,
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
    "name": "validateMutationTest11ChangeNamePhonesMutation",
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
    "name": "validateMutationTest11ChangeNamePhonesMutation",
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
    "cacheID": "afc7a7ea204cc046ccf38bbbf0183ad1",
    "id": null,
    "metadata": {},
    "name": "validateMutationTest11ChangeNamePhonesMutation",
    "operationKind": "mutation",
    "text": "mutation validateMutationTest11ChangeNamePhonesMutation(\n  $input: ActorNameChangeInput!\n) {\n  actorNameChange(input: $input) {\n    actor {\n      __typename\n      allPhones {\n        isVerified\n      }\n      id\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "d325725acb2360c9d321a5a3e830a5f3";
}

module.exports = ((node/*: any*/)/*: Mutation<
  validateMutationTest11ChangeNamePhonesMutation$variables,
  validateMutationTest11ChangeNamePhonesMutation$data,
>*/);
