/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<dd4174a3c07572c94ddfd9ede432f923>>
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
export type RelayPublishQueueTest2Mutation$variables = {|
  input: ActorNameChangeInput,
|};
export type RelayPublishQueueTest2Mutation$data = {|
  +changeName: ?{|
    +actor: ?{|
      +name: ?string,
    |},
  |},
|};
export type RelayPublishQueueTest2Mutation = {|
  response: RelayPublishQueueTest2Mutation$data,
  variables: RelayPublishQueueTest2Mutation$variables,
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
  "name": "name",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayPublishQueueTest2Mutation",
    "selections": [
      {
        "alias": "changeName",
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
              (v2/*:: as any*/)
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
    "name": "RelayPublishQueueTest2Mutation",
    "selections": [
      {
        "alias": "changeName",
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
              (v2/*:: as any*/),
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
    "cacheID": "98eafdbb3e088582da5b72ecd4b52055",
    "id": null,
    "metadata": {},
    "name": "RelayPublishQueueTest2Mutation",
    "operationKind": "mutation",
    "text": "mutation RelayPublishQueueTest2Mutation(\n  $input: ActorNameChangeInput!\n) {\n  changeName: actorNameChange(input: $input) {\n    actor {\n      __typename\n      name\n      id\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "db89137a4953b4b3ad82707843fce73b";
}

module.exports = ((node/*:: as any*/)/*:: as Mutation<
  RelayPublishQueueTest2Mutation$variables,
  RelayPublishQueueTest2Mutation$data,
>*/);
