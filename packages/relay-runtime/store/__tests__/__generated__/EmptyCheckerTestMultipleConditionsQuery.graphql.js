/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<d061bf400da210f17ced066fbbc4fcf8>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type EmptyCheckerTestMultipleConditionsQuery$variables = {|
  cond1: boolean,
  cond2: boolean,
|};
export type EmptyCheckerTestMultipleConditionsQuery$data = {|
  +me?: ?{|
    +id: string,
    +name: ?string,
  |},
  +viewer?: ?{|
    +actor: ?{|
      +name: ?string,
    |},
  |},
|};
export type EmptyCheckerTestMultipleConditionsQuery = {|
  response: EmptyCheckerTestMultipleConditionsQuery$data,
  variables: EmptyCheckerTestMultipleConditionsQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "cond1"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "cond2"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v3 = {
  "condition": "cond1",
  "kind": "Condition",
  "passingValue": true,
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "User",
      "kind": "LinkedField",
      "name": "me",
      "plural": false,
      "selections": [
        (v1/*: any*/),
        (v2/*: any*/)
      ],
      "storageKey": null
    }
  ]
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "EmptyCheckerTestMultipleConditionsQuery",
    "selections": [
      (v3/*: any*/),
      {
        "condition": "cond2",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "Viewer",
            "kind": "LinkedField",
            "name": "viewer",
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
        ]
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "EmptyCheckerTestMultipleConditionsQuery",
    "selections": [
      (v3/*: any*/),
      {
        "condition": "cond2",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "Viewer",
            "kind": "LinkedField",
            "name": "viewer",
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
                  (v1/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ]
      }
    ]
  },
  "params": {
    "cacheID": "0f1dd6da59715ff9dae3dff96826f0cb",
    "id": null,
    "metadata": {},
    "name": "EmptyCheckerTestMultipleConditionsQuery",
    "operationKind": "query",
    "text": "query EmptyCheckerTestMultipleConditionsQuery(\n  $cond1: Boolean!\n  $cond2: Boolean!\n) {\n  me @include(if: $cond1) {\n    id\n    name\n  }\n  viewer @include(if: $cond2) {\n    actor {\n      __typename\n      name\n      id\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "2df83724e07ff85ee679c5373118fe14";
}

module.exports = ((node/*: any*/)/*: Query<
  EmptyCheckerTestMultipleConditionsQuery$variables,
  EmptyCheckerTestMultipleConditionsQuery$data,
>*/);
