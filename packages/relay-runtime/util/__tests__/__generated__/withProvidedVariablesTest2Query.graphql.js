/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<28b3eba1bf961281a612ddc50ead4b1f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { withProvidedVariablesTest2Fragment$fragmentType } from "./withProvidedVariablesTest2Fragment.graphql";
export type withProvidedVariablesTest2Query$variables = {|
  includeFriendsCount: boolean,
|};
export type withProvidedVariablesTest2Query$data = {|
  +node: ?{|
    +$fragmentSpreads: withProvidedVariablesTest2Fragment$fragmentType,
  |},
|};
export type withProvidedVariablesTest2Query = {|
  response: withProvidedVariablesTest2Query$data,
  variables: withProvidedVariablesTest2Query$variables,
|};
({
  "__relay_internal__pv__provideNumberOfFriendsrelayprovider": require('./../provideNumberOfFriends.relayprovider')
}: {|
  +__relay_internal__pv__provideNumberOfFriendsrelayprovider: {|
    +get: () => number,
  |},
|});
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "includeFriendsCount"
},
v1 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": 4
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "withProvidedVariablesTest2Query",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "args": [
              {
                "kind": "Variable",
                "name": "includeFriendsCount_",
                "variableName": "includeFriendsCount"
              }
            ],
            "kind": "FragmentSpread",
            "name": "withProvidedVariablesTest2Fragment"
          }
        ],
        "storageKey": "node(id:4)"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v0/*: any*/),
      {
        "defaultValue": null,
        "kind": "LocalArgument",
        "name": "__relay_internal__pv__provideNumberOfFriendsrelayprovider"
      }
    ],
    "kind": "Operation",
    "name": "withProvidedVariablesTest2Query",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
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
                "args": [
                  {
                    "kind": "Variable",
                    "name": "first",
                    "variableName": "__relay_internal__pv__provideNumberOfFriendsrelayprovider"
                  }
                ],
                "concreteType": "FriendsConnection",
                "kind": "LinkedField",
                "name": "friends",
                "plural": false,
                "selections": [
                  {
                    "condition": "includeFriendsCount",
                    "kind": "Condition",
                    "passingValue": true,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "count",
                        "storageKey": null
                      }
                    ]
                  }
                ],
                "storageKey": null
              }
            ],
            "type": "User",
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
        "storageKey": "node(id:4)"
      }
    ]
  },
  "params": {
    "cacheID": "1c17170dd6100840a8f2a65d04036d20",
    "id": null,
    "metadata": {},
    "name": "withProvidedVariablesTest2Query",
    "operationKind": "query",
    "text": "query withProvidedVariablesTest2Query(\n  $includeFriendsCount: Boolean!\n  $__relay_internal__pv__provideNumberOfFriendsrelayprovider: Int!\n) {\n  node(id: 4) {\n    __typename\n    ...withProvidedVariablesTest2Fragment_47ZY3u\n    id\n  }\n}\n\nfragment withProvidedVariablesTest2Fragment_47ZY3u on User {\n  friends(first: $__relay_internal__pv__provideNumberOfFriendsrelayprovider) {\n    count @include(if: $includeFriendsCount)\n  }\n}\n",
    "providedVariables": {
      "__relay_internal__pv__provideNumberOfFriendsrelayprovider": require('./../provideNumberOfFriends.relayprovider')
    }
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "e9e93574d0f69b01f4abac7b2738cece";
}

module.exports = ((node/*: any*/)/*: Query<
  withProvidedVariablesTest2Query$variables,
  withProvidedVariablesTest2Query$data,
>*/);
