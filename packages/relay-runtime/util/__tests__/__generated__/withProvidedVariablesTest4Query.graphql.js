/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<08e727524f8414baece4a12bb895d1f3>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type withProvidedVariablesTest4Fragment1$fragmentType = any;
type withProvidedVariablesTest4Fragment2$fragmentType = any;
export type withProvidedVariablesTest4Query$variables = {||};
export type withProvidedVariablesTest4Query$data = {|
  +node: ?{|
    +$fragmentSpreads: withProvidedVariablesTest4Fragment1$fragmentType & withProvidedVariablesTest4Fragment2$fragmentType,
  |},
|};
export type withProvidedVariablesTest4Query = {|
  variables: withProvidedVariablesTest4Query$variables,
  response: withProvidedVariablesTest4Query$data,
|};
type ProvidedVariablesType = {|
  +__relay_internal__pv__provideNumberOfFriends: {|
    +get: () => number,
  |},
  +__relay_internal__pv__provideIncludeUserNames: {|
    +get: () => boolean,
  |},
|};
*/

var providedVariablesDefinition/*: ProvidedVariablesType*/ = {
  "__relay_internal__pv__provideNumberOfFriends": require('./../provideNumberOfFriends'),
  "__relay_internal__pv__provideIncludeUserNames": require('./../provideIncludeUserNames')
};

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": 4
  }
],
v1 = {
  "condition": "__relay_internal__pv__provideIncludeUserNames",
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
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "withProvidedVariablesTest4Query",
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
            "name": "withProvidedVariablesTest4Fragment1"
          },
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "withProvidedVariablesTest4Fragment2"
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
        "name": "__relay_internal__pv__provideNumberOfFriends"
      },
      {
        "defaultValue": null,
        "kind": "LocalArgument",
        "name": "__relay_internal__pv__provideIncludeUserNames"
      }
    ],
    "kind": "Operation",
    "name": "withProvidedVariablesTest4Query",
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
                    "variableName": "__relay_internal__pv__provideNumberOfFriends"
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
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "FriendsEdge",
                    "kind": "LinkedField",
                    "name": "edges",
                    "plural": true,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "User",
                        "kind": "LinkedField",
                        "name": "node",
                        "plural": false,
                        "selections": [
                          (v1/*: any*/),
                          (v2/*: any*/)
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              (v1/*: any*/)
            ],
            "type": "User",
            "abstractKey": null
          },
          (v2/*: any*/)
        ],
        "storageKey": "node(id:4)"
      }
    ]
  },
  "params": {
    "cacheID": "ffbf7db2182b3613a98667945a211f8f",
    "id": null,
    "metadata": {},
    "name": "withProvidedVariablesTest4Query",
    "operationKind": "query",
    "text": "query withProvidedVariablesTest4Query(\n  $__relay_internal__pv__provideNumberOfFriends: Int!\n  $__relay_internal__pv__provideIncludeUserNames: Boolean!\n) {\n  node(id: 4) {\n    __typename\n    ...withProvidedVariablesTest4Fragment1\n    ...withProvidedVariablesTest4Fragment2\n    id\n  }\n}\n\nfragment withProvidedVariablesTest4Fragment1 on User {\n  friends(first: $__relay_internal__pv__provideNumberOfFriends) {\n    count\n    edges {\n      node {\n        name @include(if: $__relay_internal__pv__provideIncludeUserNames)\n        id\n      }\n    }\n  }\n}\n\nfragment withProvidedVariablesTest4Fragment2 on User {\n  name @include(if: $__relay_internal__pv__provideIncludeUserNames)\n}\n",
    "providedVariables": providedVariablesDefinition
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "08096779ec00305df9771824e002669c";
}

module.exports = ((node/*: any*/)/*: Query<
  withProvidedVariablesTest4Query$variables,
  withProvidedVariablesTest4Query$data,
>*/);
