/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<fb2275300d1d6bc809c50e15cc1148dc>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayModernEnvironmentExecuteWithProvidedVariableTest_profile1$fragmentType } from "./RelayModernEnvironmentExecuteWithProvidedVariableTest_profile1.graphql";
import type { RelayModernEnvironmentExecuteWithProvidedVariableTest_profile2$fragmentType } from "./RelayModernEnvironmentExecuteWithProvidedVariableTest_profile2.graphql";
import type { RelayModernEnvironmentExecuteWithProvidedVariableTest_profile3$fragmentType } from "./RelayModernEnvironmentExecuteWithProvidedVariableTest_profile3.graphql";
export type RelayModernEnvironmentExecuteWithProvidedVariableTest_UserArgManyFragmentsQuery$variables = {|
  id: string,
|};
export type RelayModernEnvironmentExecuteWithProvidedVariableTest_UserArgManyFragmentsQuery$data = {|
  +node: ?{|
    +$fragmentSpreads: RelayModernEnvironmentExecuteWithProvidedVariableTest_profile1$fragmentType & RelayModernEnvironmentExecuteWithProvidedVariableTest_profile2$fragmentType & RelayModernEnvironmentExecuteWithProvidedVariableTest_profile3$fragmentType,
  |},
|};
export type RelayModernEnvironmentExecuteWithProvidedVariableTest_UserArgManyFragmentsQuery = {|
  response: RelayModernEnvironmentExecuteWithProvidedVariableTest_UserArgManyFragmentsQuery$data,
  variables: RelayModernEnvironmentExecuteWithProvidedVariableTest_UserArgManyFragmentsQuery$variables,
|};
({
  "__relay_internal__pv__RelayProvider_returnsTruerelayprovider": require('../RelayProvider_returnsTrue.relayprovider'),
  "__relay_internal__pv__RelayProvider_pictureScalerelayprovider": require('../RelayProvider_pictureScale.relayprovider')
}: {|
  +__relay_internal__pv__RelayProvider_pictureScalerelayprovider: {|
    +get: () => number,
  |},
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
],
v2 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "uri",
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentExecuteWithProvidedVariableTest_UserArgManyFragmentsQuery",
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
          },
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "RelayModernEnvironmentExecuteWithProvidedVariableTest_profile2"
          },
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "RelayModernEnvironmentExecuteWithProvidedVariableTest_profile3"
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
      },
      {
        "defaultValue": null,
        "kind": "LocalArgument",
        "name": "__relay_internal__pv__RelayProvider_pictureScalerelayprovider"
      }
    ],
    "kind": "Operation",
    "name": "RelayModernEnvironmentExecuteWithProvidedVariableTest_UserArgManyFragmentsQuery",
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
                "selections": (v2/*: any*/),
                "storageKey": null
              },
              {
                "alias": null,
                "args": [
                  {
                    "kind": "Variable",
                    "name": "scale",
                    "variableName": "__relay_internal__pv__RelayProvider_pictureScalerelayprovider"
                  }
                ],
                "concreteType": "Image",
                "kind": "LinkedField",
                "name": "profile_picture",
                "plural": false,
                "selections": (v2/*: any*/),
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
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "alternate_name",
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
    "cacheID": "06e5816fc5fcf9504d366918c90aca93",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentExecuteWithProvidedVariableTest_UserArgManyFragmentsQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentExecuteWithProvidedVariableTest_UserArgManyFragmentsQuery(\n  $id: ID!\n  $__relay_internal__pv__RelayProvider_returnsTruerelayprovider: Boolean!\n  $__relay_internal__pv__RelayProvider_pictureScalerelayprovider: Float!\n) {\n  node(id: $id) {\n    __typename\n    ...RelayModernEnvironmentExecuteWithProvidedVariableTest_profile1\n    ...RelayModernEnvironmentExecuteWithProvidedVariableTest_profile2\n    ...RelayModernEnvironmentExecuteWithProvidedVariableTest_profile3\n    id\n  }\n}\n\nfragment RelayModernEnvironmentExecuteWithProvidedVariableTest_profile1 on User {\n  id\n  name @include(if: $__relay_internal__pv__RelayProvider_returnsTruerelayprovider)\n  username @skip(if: $__relay_internal__pv__RelayProvider_returnsTruerelayprovider)\n  profilePicture {\n    uri\n  }\n}\n\nfragment RelayModernEnvironmentExecuteWithProvidedVariableTest_profile2 on User {\n  name @include(if: $__relay_internal__pv__RelayProvider_returnsTruerelayprovider)\n  alternate_name @include(if: $__relay_internal__pv__RelayProvider_returnsTruerelayprovider)\n}\n\nfragment RelayModernEnvironmentExecuteWithProvidedVariableTest_profile3 on User {\n  profile_picture(scale: $__relay_internal__pv__RelayProvider_pictureScalerelayprovider) {\n    uri\n  }\n}\n",
    "providedVariables": {
      "__relay_internal__pv__RelayProvider_returnsTruerelayprovider": require('../RelayProvider_returnsTrue.relayprovider'),
      "__relay_internal__pv__RelayProvider_pictureScalerelayprovider": require('../RelayProvider_pictureScale.relayprovider')
    }
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "27f90d252de1907833b6031e90a40707";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentExecuteWithProvidedVariableTest_UserArgManyFragmentsQuery$variables,
  RelayModernEnvironmentExecuteWithProvidedVariableTest_UserArgManyFragmentsQuery$data,
>*/);
