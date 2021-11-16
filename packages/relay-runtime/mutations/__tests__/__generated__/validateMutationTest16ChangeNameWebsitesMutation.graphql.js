/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<769588c7a49a89179d0121ac12c0268e>>
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
export type validateMutationTest16ChangeNameWebsitesMutation$variables = {|
  input: ActorNameChangeInput,
|};
export type validateMutationTest16ChangeNameWebsitesMutationVariables = validateMutationTest16ChangeNameWebsitesMutation$variables;
export type validateMutationTest16ChangeNameWebsitesMutation$data = {|
  +actorNameChange: ?{|
    +actor: ?{|
      +websites: ?$ReadOnlyArray<?string>,
    |},
  |},
|};
export type validateMutationTest16ChangeNameWebsitesMutationResponse = validateMutationTest16ChangeNameWebsitesMutation$data;
export type validateMutationTest16ChangeNameWebsitesMutation = {|
  variables: validateMutationTest16ChangeNameWebsitesMutationVariables,
  response: validateMutationTest16ChangeNameWebsitesMutation$data,
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
  "name": "websites",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "validateMutationTest16ChangeNameWebsitesMutation",
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
    "name": "validateMutationTest16ChangeNameWebsitesMutation",
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
    "cacheID": "2ec235244392c4c34a9d78a966726988",
    "id": null,
    "metadata": {},
    "name": "validateMutationTest16ChangeNameWebsitesMutation",
    "operationKind": "mutation",
    "text": "mutation validateMutationTest16ChangeNameWebsitesMutation(\n  $input: ActorNameChangeInput!\n) {\n  actorNameChange(input: $input) {\n    actor {\n      __typename\n      websites\n      id\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "55ab419f1d441f3c273ae1ab5e4c6007";
}

module.exports = ((node/*: any*/)/*: Mutation<
  validateMutationTest16ChangeNameWebsitesMutation$variables,
  validateMutationTest16ChangeNameWebsitesMutation$data,
>*/);
