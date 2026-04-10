/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<e6446f117038d70098cef09eb6012e8c>>
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
export type validateMutationTest9ChangeNameIncludeMutation$variables = {|
  input: ActorNameChangeInput,
  myVar: boolean,
|};
export type validateMutationTest9ChangeNameIncludeMutation$data = {|
  +actorNameChange: ?{|
    +actor: ?({|
      +__typename: "Page",
      +canViewerLike?: ?boolean,
      +username?: ?string,
    |} | {|
      // This will never be '%other', but we need some
      // value in case none of the concrete values match.
      +__typename: "%other",
    |}),
  |},
|};
export type validateMutationTest9ChangeNameIncludeMutation = {|
  response: validateMutationTest9ChangeNameIncludeMutation$data,
  variables: validateMutationTest9ChangeNameIncludeMutation$variables,
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
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "validateMutationTest9ChangeNameIncludeMutation",
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
                "condition": "myVar",
                "kind": "Condition",
                "passingValue": true,
                "selections": [
                  (v2/*:: as any*/)
                ]
              },
              {
                "condition": "myVar",
                "kind": "Condition",
                "passingValue": false,
                "selections": [
                  (v3/*:: as any*/)
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
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "validateMutationTest9ChangeNameIncludeMutation",
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
                "condition": "myVar",
                "kind": "Condition",
                "passingValue": true,
                "selections": [
                  (v4/*:: as any*/),
                  (v2/*:: as any*/)
                ]
              },
              {
                "condition": "myVar",
                "kind": "Condition",
                "passingValue": false,
                "selections": [
                  (v4/*:: as any*/),
                  (v3/*:: as any*/)
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
  (node/*:: as any*/).hash = "ddd23cc94f573f555ba2a466ccbdacdd";
}

module.exports = ((node/*:: as any*/)/*:: as Mutation<
  validateMutationTest9ChangeNameIncludeMutation$variables,
  validateMutationTest9ChangeNameIncludeMutation$data,
>*/);
