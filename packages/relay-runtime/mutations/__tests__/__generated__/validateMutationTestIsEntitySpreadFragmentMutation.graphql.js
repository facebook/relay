/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<b7335107eae9ad9be9c6134c22759e1b>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Mutation } from 'relay-runtime';
import type { validateMutationTestEntityFragement$fragmentType } from "./validateMutationTestEntityFragement.graphql";
export type ActorNameChangeInput = {|
  newName?: ?string,
|};
export type validateMutationTestIsEntitySpreadFragmentMutation$variables = {|
  input: ActorNameChangeInput,
|};
export type validateMutationTestIsEntitySpreadFragmentMutation$data = {|
  +actorNameChange: ?{|
    +actor: ?{|
      +$fragmentSpreads: validateMutationTestEntityFragement$fragmentType,
    |},
  |},
|};
export type validateMutationTestIsEntitySpreadFragmentMutation$rawResponse = {|
  +actorNameChange: ?{|
    +actor: ?{|
      +__typename: string,
      +__isEntity: string,
      +id: string,
      +url: ?string,
    |},
  |},
|};
export type validateMutationTestIsEntitySpreadFragmentMutation = {|
  rawResponse: validateMutationTestIsEntitySpreadFragmentMutation$rawResponse,
  response: validateMutationTestIsEntitySpreadFragmentMutation$data,
  variables: validateMutationTestIsEntitySpreadFragmentMutation$variables,
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
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "validateMutationTestIsEntitySpreadFragmentMutation",
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
                "args": null,
                "kind": "FragmentSpread",
                "name": "validateMutationTestEntityFragement"
              }
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
    "name": "validateMutationTestIsEntitySpreadFragmentMutation",
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
              {
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
              },
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
    "cacheID": "3d4b985849517e5f63cd455d0468a34f",
    "id": null,
    "metadata": {},
    "name": "validateMutationTestIsEntitySpreadFragmentMutation",
    "operationKind": "mutation",
    "text": "mutation validateMutationTestIsEntitySpreadFragmentMutation(\n  $input: ActorNameChangeInput!\n) {\n  actorNameChange(input: $input) {\n    actor {\n      __typename\n      ...validateMutationTestEntityFragement\n      id\n    }\n  }\n}\n\nfragment validateMutationTestEntityFragement on Entity {\n  __isEntity: __typename\n  url\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "91935f764b37e5a36ce360731e9f75ed";
}

module.exports = ((node/*: any*/)/*: Mutation<
  validateMutationTestIsEntitySpreadFragmentMutation$variables,
  validateMutationTestIsEntitySpreadFragmentMutation$data,
  validateMutationTestIsEntitySpreadFragmentMutation$rawResponse,
>*/);
