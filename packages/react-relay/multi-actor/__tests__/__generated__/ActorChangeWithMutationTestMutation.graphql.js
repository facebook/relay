/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<a7f88f86b4d7b6e252ca4e5cf6d90ea5>>
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
export type ActorChangeWithMutationTestMutation$variables = {|
  input?: ?ActorNameChangeInput,
|};
export type ActorChangeWithMutationTestMutationVariables = ActorChangeWithMutationTestMutation$variables;
export type ActorChangeWithMutationTestMutation$data = {|
  +actorNameChange: ?{|
    +actor: ?{|
      +id: string,
      +name: ?string,
    |},
  |},
|};
export type ActorChangeWithMutationTestMutationResponse = ActorChangeWithMutationTestMutation$data;
export type ActorChangeWithMutationTestMutation = {|
  variables: ActorChangeWithMutationTestMutationVariables,
  response: ActorChangeWithMutationTestMutation$data,
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
  "name": "id",
  "storageKey": null
},
v3 = {
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
    "name": "ActorChangeWithMutationTestMutation",
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
              (v2/*: any*/),
              (v3/*: any*/)
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
    "name": "ActorChangeWithMutationTestMutation",
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
              (v3/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "c9d4687f44d3f2426997ebb521771342",
    "id": null,
    "metadata": {},
    "name": "ActorChangeWithMutationTestMutation",
    "operationKind": "mutation",
    "text": "mutation ActorChangeWithMutationTestMutation(\n  $input: ActorNameChangeInput\n) {\n  actorNameChange(input: $input) {\n    actor {\n      __typename\n      id\n      name\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "92eae6cb2eaa618b730b7c4d3e528a03";
}

module.exports = ((node/*: any*/)/*: Mutation<
  ActorChangeWithMutationTestMutation$variables,
  ActorChangeWithMutationTestMutation$data,
>*/);
