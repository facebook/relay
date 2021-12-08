/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<02b2dd7b7e24348320c8fe8f7f075a43>>
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
export type validateMutationTest10ChangeNameIncludeBoolMutation$variables = {|
  input: ActorNameChangeInput,
  myVar: boolean,
|};
export type validateMutationTest10ChangeNameIncludeBoolMutationVariables = validateMutationTest10ChangeNameIncludeBoolMutation$variables;
export type validateMutationTest10ChangeNameIncludeBoolMutation$data = {|
  +actorNameChange: ?{|
    +actor: ?{|
      +username?: ?string,
      +canViewerLike?: ?boolean,
    |},
  |},
|};
export type validateMutationTest10ChangeNameIncludeBoolMutationResponse = validateMutationTest10ChangeNameIncludeBoolMutation$data;
export type validateMutationTest10ChangeNameIncludeBoolMutation = {|
  variables: validateMutationTest10ChangeNameIncludeBoolMutationVariables,
  response: validateMutationTest10ChangeNameIncludeBoolMutation$data,
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
    "name": "validateMutationTest10ChangeNameIncludeBoolMutation",
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
    "name": "validateMutationTest10ChangeNameIncludeBoolMutation",
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
    "cacheID": "e9377918629cb2259cb388f79d0da1bd",
    "id": null,
    "metadata": {},
    "name": "validateMutationTest10ChangeNameIncludeBoolMutation",
    "operationKind": "mutation",
    "text": "mutation validateMutationTest10ChangeNameIncludeBoolMutation(\n  $input: ActorNameChangeInput!\n  $myVar: Boolean!\n) {\n  actorNameChange(input: $input) {\n    actor {\n      __typename\n      __isActor: __typename @include(if: $myVar)\n      ... on Page @include(if: $myVar) {\n        username\n      }\n      __isActor: __typename @skip(if: $myVar)\n      ... on Page @skip(if: $myVar) {\n        canViewerLike\n      }\n      id\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "d32f98ddfabecf63aee0603885209836";
}

module.exports = ((node/*: any*/)/*: Mutation<
  validateMutationTest10ChangeNameIncludeBoolMutation$variables,
  validateMutationTest10ChangeNameIncludeBoolMutation$data,
>*/);
