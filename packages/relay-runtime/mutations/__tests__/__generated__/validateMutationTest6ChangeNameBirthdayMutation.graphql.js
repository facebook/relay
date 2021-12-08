/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<d1bc510395b3bff771df984ce5bcf950>>
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
export type validateMutationTest6ChangeNameBirthdayMutation$variables = {|
  input: ActorNameChangeInput,
|};
export type validateMutationTest6ChangeNameBirthdayMutationVariables = validateMutationTest6ChangeNameBirthdayMutation$variables;
export type validateMutationTest6ChangeNameBirthdayMutation$data = {|
  +actorNameChange: ?{|
    +actor: ?{|
      +birthdate?: ?{|
        +day: ?number,
        +month: ?number,
        +year: ?number,
      |},
      +username?: ?string,
    |},
  |},
|};
export type validateMutationTest6ChangeNameBirthdayMutationResponse = validateMutationTest6ChangeNameBirthdayMutation$data;
export type validateMutationTest6ChangeNameBirthdayMutation = {|
  variables: validateMutationTest6ChangeNameBirthdayMutationVariables,
  response: validateMutationTest6ChangeNameBirthdayMutation$data,
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "validateMutationTest6ChangeNameBirthdayMutation",
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
    "name": "validateMutationTest6ChangeNameBirthdayMutation",
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
              (v3/*: any*/),
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
    "cacheID": "afed371a868374f69d41d6d0468eb29d",
    "id": null,
    "metadata": {},
    "name": "validateMutationTest6ChangeNameBirthdayMutation",
    "operationKind": "mutation",
    "text": "mutation validateMutationTest6ChangeNameBirthdayMutation(\n  $input: ActorNameChangeInput!\n) {\n  actorNameChange(input: $input) {\n    actor {\n      __typename\n      ... on User {\n        birthdate {\n          day\n          month\n          year\n        }\n      }\n      ... on Page {\n        username\n      }\n      id\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "d80209a1d442a2efc9d48718ce645ff2";
}

module.exports = ((node/*: any*/)/*: Mutation<
  validateMutationTest6ChangeNameBirthdayMutation$variables,
  validateMutationTest6ChangeNameBirthdayMutation$data,
>*/);
