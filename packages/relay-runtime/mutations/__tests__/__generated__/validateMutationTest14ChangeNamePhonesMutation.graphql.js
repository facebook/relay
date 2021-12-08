/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<57c3b5e0464dd20270db06d19a1922f8>>
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
export type validateMutationTest14ChangeNamePhonesMutation$variables = {|
  input: ActorNameChangeInput,
|};
export type validateMutationTest14ChangeNamePhonesMutationVariables = validateMutationTest14ChangeNamePhonesMutation$variables;
export type validateMutationTest14ChangeNamePhonesMutation$data = {|
  +actorNameChange: ?{|
    +actor: ?{|
      +allPhones: ?$ReadOnlyArray<?{|
        +isVerified: ?boolean,
      |}>,
    |},
  |},
|};
export type validateMutationTest14ChangeNamePhonesMutationResponse = validateMutationTest14ChangeNamePhonesMutation$data;
export type validateMutationTest14ChangeNamePhonesMutation = {|
  variables: validateMutationTest14ChangeNamePhonesMutationVariables,
  response: validateMutationTest14ChangeNamePhonesMutation$data,
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
    "name": "validateMutationTest14ChangeNamePhonesMutation",
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
    "name": "validateMutationTest14ChangeNamePhonesMutation",
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
    "cacheID": "93358de91dfdec74ca3d2560557e8a82",
    "id": null,
    "metadata": {},
    "name": "validateMutationTest14ChangeNamePhonesMutation",
    "operationKind": "mutation",
    "text": "mutation validateMutationTest14ChangeNamePhonesMutation(\n  $input: ActorNameChangeInput!\n) {\n  actorNameChange(input: $input) {\n    actor {\n      __typename\n      allPhones {\n        isVerified\n      }\n      id\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "b5ad81099888390e9b9d3475735a3797";
}

module.exports = ((node/*: any*/)/*: Mutation<
  validateMutationTest14ChangeNamePhonesMutation$variables,
  validateMutationTest14ChangeNamePhonesMutation$data,
>*/);
