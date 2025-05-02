/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<f8c5e5591101a4e500151b5f18c913d9>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayModernEnvironmentExecuteWithProvidedVariableTest_profile1$fragmentType } from "./RelayModernEnvironmentExecuteWithProvidedVariableTest_profile1.graphql";
export type RelayModernEnvironmentExecuteWithProvidedVariableTest_UserArgSingleFragmentQuery$variables = {|
  id: string,
|};
export type RelayModernEnvironmentExecuteWithProvidedVariableTest_UserArgSingleFragmentQuery$data = {|
  +node: ?{|
    +$fragmentSpreads: RelayModernEnvironmentExecuteWithProvidedVariableTest_profile1$fragmentType,
  |},
|};
export type RelayModernEnvironmentExecuteWithProvidedVariableTest_UserArgSingleFragmentQuery = {|
  response: RelayModernEnvironmentExecuteWithProvidedVariableTest_UserArgSingleFragmentQuery$data,
  variables: RelayModernEnvironmentExecuteWithProvidedVariableTest_UserArgSingleFragmentQuery$variables,
|};
({
  "__relay_internal__pv__RelayProvider_returnsTruerelayprovider": require('../RelayProvider_returnsTrue.relayprovider')
}: {|
  +__relay_internal__pv__RelayProvider_returnsTruerelayprovider: {|
    +get: () => boolean,
  |},
|});
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "id"
},
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentExecuteWithProvidedVariableTest_UserArgSingleFragmentQuery",
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
            "args": null,
            "kind": "FragmentSpread",
            "name": "RelayModernEnvironmentExecuteWithProvidedVariableTest_profile1"
          }
        ],
        "storageKey": null
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
        "name": "__relay_internal__pv__RelayProvider_returnsTruerelayprovider"
      }
    ],
    "kind": "Operation",
    "name": "RelayModernEnvironmentExecuteWithProvidedVariableTest_UserArgSingleFragmentQuery",
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
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "Image",
                "kind": "LinkedField",
                "name": "profilePicture",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "uri",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "condition": "__relay_internal__pv__RelayProvider_returnsTruerelayprovider",
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
                "condition": "__relay_internal__pv__RelayProvider_returnsTruerelayprovider",
                "kind": "Condition",
                "passingValue": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "username",
                    "storageKey": null
                  }
                ]
              }
            ],
            "type": "User",
            "abstractKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "9b7f13b4f1160c50e089312c31fd3580",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentExecuteWithProvidedVariableTest_UserArgSingleFragmentQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentExecuteWithProvidedVariableTest_UserArgSingleFragmentQuery(\n  $id: ID!\n  $__relay_internal__pv__RelayProvider_returnsTruerelayprovider: Boolean!\n) {\n  node(id: $id) {\n    __typename\n    ...RelayModernEnvironmentExecuteWithProvidedVariableTest_profile1\n    id\n  }\n}\n\nfragment RelayModernEnvironmentExecuteWithProvidedVariableTest_profile1 on User {\n  id\n  name @include(if: $__relay_internal__pv__RelayProvider_returnsTruerelayprovider)\n  username @skip(if: $__relay_internal__pv__RelayProvider_returnsTruerelayprovider)\n  profilePicture {\n    uri\n  }\n}\n",
    "providedVariables": {
      "__relay_internal__pv__RelayProvider_returnsTruerelayprovider": require('../RelayProvider_returnsTrue.relayprovider')
    }
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "ceb095ac103f8ed7a4155eead5586b81";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentExecuteWithProvidedVariableTest_UserArgSingleFragmentQuery$variables,
  RelayModernEnvironmentExecuteWithProvidedVariableTest_UserArgSingleFragmentQuery$data,
>*/);
