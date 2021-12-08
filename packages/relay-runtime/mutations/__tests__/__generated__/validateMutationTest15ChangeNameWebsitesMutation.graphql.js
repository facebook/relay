/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<b9fafd409982c4286d015909ab674f19>>
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
export type validateMutationTest15ChangeNameWebsitesMutation$variables = {|
  input: ActorNameChangeInput,
|};
export type validateMutationTest15ChangeNameWebsitesMutationVariables = validateMutationTest15ChangeNameWebsitesMutation$variables;
export type validateMutationTest15ChangeNameWebsitesMutation$data = {|
  +actorNameChange: ?{|
    +actor: ?{|
      +websites: ?$ReadOnlyArray<?string>,
    |},
  |},
|};
export type validateMutationTest15ChangeNameWebsitesMutationResponse = validateMutationTest15ChangeNameWebsitesMutation$data;
export type validateMutationTest15ChangeNameWebsitesMutation = {|
  variables: validateMutationTest15ChangeNameWebsitesMutationVariables,
  response: validateMutationTest15ChangeNameWebsitesMutation$data,
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
    "name": "validateMutationTest15ChangeNameWebsitesMutation",
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
    "name": "validateMutationTest15ChangeNameWebsitesMutation",
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
    "cacheID": "f702a75c640ecd5e8abb4ab5df486229",
    "id": null,
    "metadata": {},
    "name": "validateMutationTest15ChangeNameWebsitesMutation",
    "operationKind": "mutation",
    "text": "mutation validateMutationTest15ChangeNameWebsitesMutation(\n  $input: ActorNameChangeInput!\n) {\n  actorNameChange(input: $input) {\n    actor {\n      __typename\n      websites\n      id\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "a8a63aaea0cd5e20ff4d743c04102462";
}

module.exports = ((node/*: any*/)/*: Mutation<
  validateMutationTest15ChangeNameWebsitesMutation$variables,
  validateMutationTest15ChangeNameWebsitesMutation$data,
>*/);
