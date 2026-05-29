/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<8f6dce77144a61178687af3bdb1f030a>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Mutation } from 'relay-runtime';
export type ActorNameChangeInput = {
  newName?: ?string,
};
export type validateMutationTestIsActorInlineMutation$variables = {
  input: ActorNameChangeInput,
};
export type validateMutationTestIsActorInlineMutation$data = {
  readonly actorNameChange: ?{
    readonly actor: ?{
      readonly birthdate?: ?{
        readonly day: ?number,
        readonly month: ?number,
        readonly year: ?number,
      },
      readonly username?: ?string,
    },
  },
};
export type validateMutationTestIsActorInlineMutation$rawResponse = {
  readonly actorNameChange: ?{
    readonly actor: ?({
      readonly __typename: "Page",
      readonly __isActor: "Page",
      readonly id: string,
      readonly username: ?string,
    } | {
      readonly __typename: "User",
      readonly __isActor: "User",
      readonly birthdate: ?{
        readonly day: ?number,
        readonly month: ?number,
        readonly year: ?number,
      },
      readonly id: string,
    } | {
      readonly __typename: string,
      readonly __isActor: string,
      readonly id: string,
    }),
  },
};
export type validateMutationTestIsActorInlineMutation = {
  rawResponse: validateMutationTestIsActorInlineMutation$rawResponse,
  response: validateMutationTestIsActorInlineMutation$data,
  variables: validateMutationTestIsActorInlineMutation$variables,
};
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
v3 = {
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
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "validateMutationTestIsActorInlineMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
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
              (v2/*:: as any*/),
              (v3/*:: as any*/)
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
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "validateMutationTestIsActorInlineMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
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
              (v2/*:: as any*/),
              (v3/*:: as any*/),
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
    "cacheID": "eb5d52979de2f598af83a348e291c3d9",
    "id": null,
    "metadata": {},
    "name": "validateMutationTestIsActorInlineMutation",
    "operationKind": "mutation",
    "text": "mutation validateMutationTestIsActorInlineMutation(\n  $input: ActorNameChangeInput!\n) {\n  actorNameChange(input: $input) {\n    actor {\n      __typename\n      __isActor: __typename\n      ... on User {\n        birthdate {\n          day\n          month\n          year\n        }\n      }\n      ... on Page {\n        username\n      }\n      id\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "cee27cf207bc3ae834b956c7dd0cd0e3";
}

module.exports = ((node/*:: as any*/)/*:: as Mutation<
  validateMutationTestIsActorInlineMutation$variables,
  validateMutationTestIsActorInlineMutation$data,
  validateMutationTestIsActorInlineMutation$rawResponse,
>*/);
