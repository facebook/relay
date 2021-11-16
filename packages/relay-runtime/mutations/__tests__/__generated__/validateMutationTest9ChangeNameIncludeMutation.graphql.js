/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<b7d0c3bc4377199a77bff07be4503ee1>>
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
export type validateMutationTest9ChangeNameIncludeMutation$variables = {|
  input: ActorNameChangeInput,
  myVar: boolean,
|};
export type validateMutationTest9ChangeNameIncludeMutationVariables = validateMutationTest9ChangeNameIncludeMutation$variables;
export type validateMutationTest9ChangeNameIncludeMutation$data = {|
  +actorNameChange: ?{|
    +actor: ?{|
      +username?: ?string,
      +canViewerLike?: ?boolean,
    |},
  |},
|};
export type validateMutationTest9ChangeNameIncludeMutationResponse = validateMutationTest9ChangeNameIncludeMutation$data;
export type validateMutationTest9ChangeNameIncludeMutation = {|
  variables: validateMutationTest9ChangeNameIncludeMutationVariables,
  response: validateMutationTest9ChangeNameIncludeMutation$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "myVar"
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
      "name": "username",
      "storageKey": null
    }
  ],
  "type": "Page",
  "abstractKey": null
},
v3 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "canViewerLike",
      "storageKey": null
    }
  ],
  "type": "Page",
  "abstractKey": null
},
v4 = {
  "kind": "TypeDiscriminator",
  "abstractKey": "__isActor"
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "validateMutationTest9ChangeNameIncludeMutation",
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
                "condition": "myVar",
                "kind": "Condition",
                "passingValue": true,
                "selections": [
                  (v2/*: any*/)
                ]
              },
              {
                "condition": "myVar",
                "kind": "Condition",
                "passingValue": false,
                "selections": [
                  (v3/*: any*/)
                ]
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
    "name": "validateMutationTest9ChangeNameIncludeMutation",
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
                "condition": "myVar",
                "kind": "Condition",
                "passingValue": true,
                "selections": [
                  (v4/*: any*/),
                  (v2/*: any*/)
                ]
              },
              {
                "condition": "myVar",
                "kind": "Condition",
                "passingValue": false,
                "selections": [
                  (v4/*: any*/),
                  (v3/*: any*/)
                ]
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
    "cacheID": "96f3b048a4098e57ec1c39333848e473",
    "id": null,
    "metadata": {},
    "name": "validateMutationTest9ChangeNameIncludeMutation",
    "operationKind": "mutation",
    "text": "mutation validateMutationTest9ChangeNameIncludeMutation(\n  $input: ActorNameChangeInput!\n  $myVar: Boolean!\n) {\n  actorNameChange(input: $input) {\n    actor {\n      __typename\n      __isActor: __typename @include(if: $myVar)\n      ... on Page @include(if: $myVar) {\n        username\n      }\n      __isActor: __typename @skip(if: $myVar)\n      ... on Page @skip(if: $myVar) {\n        canViewerLike\n      }\n      id\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "ddd23cc94f573f555ba2a466ccbdacdd";
}

module.exports = ((node/*: any*/)/*: Mutation<
  validateMutationTest9ChangeNameIncludeMutation$variables,
  validateMutationTest9ChangeNameIncludeMutation$data,
>*/);
