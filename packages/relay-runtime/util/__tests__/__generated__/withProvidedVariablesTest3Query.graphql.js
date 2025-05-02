/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<accb0432370a6991b27b154f69667528>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { withProvidedVariablesTest3Fragment$fragmentType } from "./withProvidedVariablesTest3Fragment.graphql";
export type withProvidedVariablesTest3Query$variables = {||};
export type withProvidedVariablesTest3Query$data = {|
  +node: ?{|
    +$fragmentSpreads: withProvidedVariablesTest3Fragment$fragmentType,
  |},
|};
export type withProvidedVariablesTest3Query = {|
  response: withProvidedVariablesTest3Query$data,
  variables: withProvidedVariablesTest3Query$variables,
|};
({
  "__relay_internal__pv__provideNumberOfFriendsrelayprovider": require('../provideNumberOfFriends.relayprovider'),
  "__relay_internal__pv__provideIncludeUserNamesrelayprovider": require('../provideIncludeUserNames.relayprovider')
}: {|
  +__relay_internal__pv__provideIncludeUserNamesrelayprovider: {|
    +get: () => boolean,
  |},
  +__relay_internal__pv__provideNumberOfFriendsrelayprovider: {|
    +get: () => number,
  |},
|});
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": 4
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "withProvidedVariablesTest3Query",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "withProvidedVariablesTest3Fragment"
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
      {
        "defaultValue": null,
        "kind": "LocalArgument",
        "name": "__relay_internal__pv__provideNumberOfFriendsrelayprovider"
      },
      {
        "defaultValue": null,
        "kind": "LocalArgument",
        "name": "__relay_internal__pv__provideIncludeUserNamesrelayprovider"
      }
    ],
    "kind": "Operation",
    "name": "withProvidedVariablesTest3Query",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
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
                "condition": "__relay_internal__pv__provideIncludeUserNamesrelayprovider",
                "kind": "Condition",
                "passingValue": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "name",
                    "storageKey": null
                  }
                ]
              },
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
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "count",
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
    "cacheID": "5df96f8b26a897a0be1e0f7d835736cf",
    "id": null,
    "metadata": {},
    "name": "withProvidedVariablesTest3Query",
    "operationKind": "query",
    "text": "query withProvidedVariablesTest3Query(\n  $__relay_internal__pv__provideNumberOfFriendsrelayprovider: Int!\n  $__relay_internal__pv__provideIncludeUserNamesrelayprovider: Boolean!\n) {\n  node(id: 4) {\n    __typename\n    ...withProvidedVariablesTest3Fragment\n    id\n  }\n}\n\nfragment withProvidedVariablesTest3Fragment on User {\n  name @include(if: $__relay_internal__pv__provideIncludeUserNamesrelayprovider)\n  friends(first: $__relay_internal__pv__provideNumberOfFriendsrelayprovider) {\n    count\n  }\n}\n",
    "providedVariables": {
      "__relay_internal__pv__provideNumberOfFriendsrelayprovider": require('../provideNumberOfFriends.relayprovider'),
      "__relay_internal__pv__provideIncludeUserNamesrelayprovider": require('../provideIncludeUserNames.relayprovider')
    }
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "e9f1d13b64d707716ef131a7ec5c3ca0";
}

module.exports = ((node/*: any*/)/*: Query<
  withProvidedVariablesTest3Query$variables,
  withProvidedVariablesTest3Query$data,
>*/);
