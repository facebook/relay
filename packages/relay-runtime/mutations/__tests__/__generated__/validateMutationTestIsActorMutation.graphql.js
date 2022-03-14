/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<eb1de5f06c90e6af8d706397a3ebf92a>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Mutation } from 'relay-runtime';
type validateMutationTestActorFragment$fragmentType = any;
export type ActorNameChangeInput = {|
  clientMutationId?: ?string,
  newName?: ?string,
|};
export type validateMutationTestIsActorMutation$variables = {|
  input: ActorNameChangeInput,
|};
export type validateMutationTestIsActorMutation$data = {|
  +actorNameChange: ?{|
    +actor: ?{|
      +$fragmentSpreads: validateMutationTestActorFragment$fragmentType,
    |},
  |},
|};
export type validateMutationTestIsActorMutation$rawResponse = {|
  +actorNameChange: ?{|
    +actor: ?({|
      +__typename: "Page",
      +__isActor: "Page",
      +id: string,
      +username: ?string,
    |} | {|
      +__typename: "User",
      +__isActor: "User",
      +birthdate: ?{|
        +day: ?number,
        +month: ?number,
        +year: ?number,
      |},
      +id: string,
    |} | {|
      +__typename: string,
      +__isActor: string,
      +id: string,
    |}),
  |},
|};
export type validateMutationTestIsActorMutation = {|
  rawResponse: validateMutationTestIsActorMutation$rawResponse,
  response: validateMutationTestIsActorMutation$data,
  variables: validateMutationTestIsActorMutation$variables,
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
    "name": "validateMutationTestIsActorMutation",
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
                "name": "validateMutationTestActorFragment"
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
    "name": "validateMutationTestIsActorMutation",
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
                "kind": "TypeDiscriminator",
                "abstractKey": "__isActor"
              },
              {
                "kind": "InlineFragment",
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Date",
                    "kind": "LinkedField",
                    "name": "birthdate",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "day",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "month",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "year",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "type": "User",
                "abstractKey": null
              },
              {
                "kind": "InlineFragment",
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "username",
                    "storageKey": null
                  }
                ],
                "type": "Page",
                "abstractKey": null
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
    "cacheID": "3e0e17695a2314b5a03f0f49255143d3",
    "id": null,
    "metadata": {},
    "name": "validateMutationTestIsActorMutation",
    "operationKind": "mutation",
    "text": "mutation validateMutationTestIsActorMutation(\n  $input: ActorNameChangeInput!\n) {\n  actorNameChange(input: $input) {\n    actor {\n      __typename\n      ...validateMutationTestActorFragment\n      id\n    }\n  }\n}\n\nfragment validateMutationTestActorFragment on Actor {\n  __isActor: __typename\n  ... on User {\n    birthdate {\n      day\n      month\n      year\n    }\n  }\n  ... on Page {\n    username\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "201e5bccf88df1d121c0eaf414a5a85e";
}

module.exports = ((node/*: any*/)/*: Mutation<
  validateMutationTestIsActorMutation$variables,
  validateMutationTestIsActorMutation$data,
  validateMutationTestIsActorMutation$rawResponse,
>*/);
