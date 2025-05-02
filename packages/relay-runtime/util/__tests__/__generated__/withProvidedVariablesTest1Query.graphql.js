/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<18c8b08a242350766dc3e35b00e88bee>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { withProvidedVariablesTest1Fragment$fragmentType } from "./withProvidedVariablesTest1Fragment.graphql";
export type withProvidedVariablesTest1Query$variables = {||};
export type withProvidedVariablesTest1Query$data = {|
  +node: ?{|
    +$fragmentSpreads: withProvidedVariablesTest1Fragment$fragmentType,
  |},
|};
export type withProvidedVariablesTest1Query = {|
  response: withProvidedVariablesTest1Query$data,
  variables: withProvidedVariablesTest1Query$variables,
|};
({
  "__relay_internal__pv__provideNumberOfFriendsrelayprovider": require('../provideNumberOfFriends.relayprovider')
}: {|
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
    "name": "withProvidedVariablesTest1Query",
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
            "name": "withProvidedVariablesTest1Fragment"
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
      }
    ],
    "kind": "Operation",
    "name": "withProvidedVariablesTest1Query",
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
    "cacheID": "cf8c5214da5208986ab1ba46c6c49148",
    "id": null,
    "metadata": {},
    "name": "withProvidedVariablesTest1Query",
    "operationKind": "query",
    "text": "query withProvidedVariablesTest1Query(\n  $__relay_internal__pv__provideNumberOfFriendsrelayprovider: Int!\n) {\n  node(id: 4) {\n    __typename\n    ...withProvidedVariablesTest1Fragment\n    id\n  }\n}\n\nfragment withProvidedVariablesTest1Fragment on User {\n  friends(first: $__relay_internal__pv__provideNumberOfFriendsrelayprovider) {\n    count\n  }\n}\n",
    "providedVariables": {
      "__relay_internal__pv__provideNumberOfFriendsrelayprovider": require('../provideNumberOfFriends.relayprovider')
    }
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "c5f46e63be71ffd76d40c58b53dc2c3a";
}

module.exports = ((node/*: any*/)/*: Query<
  withProvidedVariablesTest1Query$variables,
  withProvidedVariablesTest1Query$data,
>*/);
