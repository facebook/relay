/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<3b0a0abb302eee61f681b49c0fbbb31d>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Mutation } from 'relay-runtime';
export type ActorNameChangeInput = {|
  newName?: ?string,
|};
export type validateMutationTestIsEntityInlineFragmentMutation$variables = {|
  input: ActorNameChangeInput,
|};
export type validateMutationTestIsEntityInlineFragmentMutation$data = {|
  +actorNameChange: ?{|
    +actor: ?{|
      +url?: ?string,
    |},
  |},
|};
export type validateMutationTestIsEntityInlineFragmentMutation$rawResponse = {|
  +actorNameChange: ?{|
    +actor: ?{|
      +__typename: string,
      +__isEntity?: string,
      +id: string,
      +url?: ?string,
    |},
  |},
|};
export type validateMutationTestIsEntityInlineFragmentMutation = {|
  rawResponse: validateMutationTestIsEntityInlineFragmentMutation$rawResponse,
  response: validateMutationTestIsEntityInlineFragmentMutation$data,
  variables: validateMutationTestIsEntityInlineFragmentMutation$variables,
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
  "kind": "InlineFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "url",
      "storageKey": null
    }
  ],
  "type": "Entity",
  "abstractKey": "__isEntity"
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "validateMutationTestIsEntityInlineFragmentMutation",
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
    "name": "validateMutationTestIsEntityInlineFragmentMutation",
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
    "cacheID": "fc7c4b159d7bebb14464cccdd7f165a2",
    "id": null,
    "metadata": {},
    "name": "validateMutationTestIsEntityInlineFragmentMutation",
    "operationKind": "mutation",
    "text": "mutation validateMutationTestIsEntityInlineFragmentMutation(\n  $input: ActorNameChangeInput!\n) {\n  actorNameChange(input: $input) {\n    actor {\n      __typename\n      ... on Entity {\n        __isEntity: __typename\n        url\n      }\n      id\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "04d782c9d92fb6004e72f629fca93a8c";
}

module.exports = ((node/*: any*/)/*: Mutation<
  validateMutationTestIsEntityInlineFragmentMutation$variables,
  validateMutationTestIsEntityInlineFragmentMutation$data,
  validateMutationTestIsEntityInlineFragmentMutation$rawResponse,
>*/);
