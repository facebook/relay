/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<5ebe02329a3bacdd9839a1cfbba21f2f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayModernEnvironmentExecuteWithProvidedVariableTest_profile1$fragmentType = any;
type RelayModernEnvironmentExecuteWithProvidedVariableTest_profile2$fragmentType = any;
type RelayModernEnvironmentExecuteWithProvidedVariableTest_profile3$fragmentType = any;
export type RelayModernEnvironmentExecuteWithProvidedVariableTest_UserArgManyFragmentsQuery$variables = {|
  id: string,
|};
export type RelayModernEnvironmentExecuteWithProvidedVariableTest_UserArgManyFragmentsQueryVariables = RelayModernEnvironmentExecuteWithProvidedVariableTest_UserArgManyFragmentsQuery$variables;
export type RelayModernEnvironmentExecuteWithProvidedVariableTest_UserArgManyFragmentsQuery$data = {|
  +node: ?{|
    +$fragmentSpreads: RelayModernEnvironmentExecuteWithProvidedVariableTest_profile1$fragmentType & RelayModernEnvironmentExecuteWithProvidedVariableTest_profile2$fragmentType & RelayModernEnvironmentExecuteWithProvidedVariableTest_profile3$fragmentType,
  |},
|};
export type RelayModernEnvironmentExecuteWithProvidedVariableTest_UserArgManyFragmentsQueryResponse = RelayModernEnvironmentExecuteWithProvidedVariableTest_UserArgManyFragmentsQuery$data;
export type RelayModernEnvironmentExecuteWithProvidedVariableTest_UserArgManyFragmentsQuery = {|
  variables: RelayModernEnvironmentExecuteWithProvidedVariableTest_UserArgManyFragmentsQueryVariables,
  response: RelayModernEnvironmentExecuteWithProvidedVariableTest_UserArgManyFragmentsQuery$data,
|};
type ProvidedVariableProviderType = {|
  +__RelayModernEnvironmentExecuteWithProvidedVariableTest_profile1__includeName: {|
    +get: () => boolean,
  |},
  +__RelayModernEnvironmentExecuteWithProvidedVariableTest_profile1__skipUsername: {|
    +get: () => boolean,
  |},
  +__RelayModernEnvironmentExecuteWithProvidedVariableTest_profile2__includeName: {|
    +get: () => boolean,
  |},
  +__RelayModernEnvironmentExecuteWithProvidedVariableTest_profile2__includeAlternateName: {|
    +get: () => boolean,
  |},
  +__RelayModernEnvironmentExecuteWithProvidedVariableTest_profile3__profilePictureScale: {|
    +get: () => number,
  |},
|};
*/

var providedVariableProviders/*: ProvidedVariableProviderType*/ = {
  "__RelayModernEnvironmentExecuteWithProvidedVariableTest_profile1__includeName": require('./../RelayProvider_returnsTrue'),
  "__RelayModernEnvironmentExecuteWithProvidedVariableTest_profile1__skipUsername": require('./../RelayProvider_returnsTrue'),
  "__RelayModernEnvironmentExecuteWithProvidedVariableTest_profile2__includeName": require('./../RelayProvider_returnsTrue'),
  "__RelayModernEnvironmentExecuteWithProvidedVariableTest_profile2__includeAlternateName": require('./../RelayProvider_returnsTrue'),
  "__RelayModernEnvironmentExecuteWithProvidedVariableTest_profile3__profilePictureScale": require('./../RelayProvider_pictureScale')
};

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
],
v3 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "name",
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
        "name": "__RelayModernEnvironmentExecuteWithProvidedVariableTest_profile1__includeName"
      },
      {
        "defaultValue": null,
        "kind": "LocalArgument",
        "name": "__RelayModernEnvironmentExecuteWithProvidedVariableTest_profile1__skipUsername"
      },
      {
        "defaultValue": null,
        "kind": "LocalArgument",
        "name": "__RelayModernEnvironmentExecuteWithProvidedVariableTest_profile2__includeName"
      },
      {
        "defaultValue": null,
        "kind": "LocalArgument",
        "name": "__RelayModernEnvironmentExecuteWithProvidedVariableTest_profile2__includeAlternateName"
      },
      {
        "defaultValue": null,
        "kind": "LocalArgument",
        "name": "__RelayModernEnvironmentExecuteWithProvidedVariableTest_profile3__profilePictureScale"
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
                    "variableName": "__RelayModernEnvironmentExecuteWithProvidedVariableTest_profile3__profilePictureScale"
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
                "condition": "__RelayModernEnvironmentExecuteWithProvidedVariableTest_profile1__includeName",
                "kind": "Condition",
                "passingValue": true,
                "selections": (v3/*: any*/)
              },
              {
                "condition": "__RelayModernEnvironmentExecuteWithProvidedVariableTest_profile1__skipUsername",
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
              },
              {
                "condition": "__RelayModernEnvironmentExecuteWithProvidedVariableTest_profile2__includeName",
                "kind": "Condition",
                "passingValue": true,
                "selections": (v3/*: any*/)
              },
              {
                "condition": "__RelayModernEnvironmentExecuteWithProvidedVariableTest_profile2__includeAlternateName",
                "kind": "Condition",
                "passingValue": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "alternate_name",
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
    "cacheID": "410850c0b91ffeb79c9375c3a1df5da8",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentExecuteWithProvidedVariableTest_UserArgManyFragmentsQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentExecuteWithProvidedVariableTest_UserArgManyFragmentsQuery(\n  $id: ID!\n  $__RelayModernEnvironmentExecuteWithProvidedVariableTest_profile1__includeName: Boolean!\n  $__RelayModernEnvironmentExecuteWithProvidedVariableTest_profile1__skipUsername: Boolean!\n  $__RelayModernEnvironmentExecuteWithProvidedVariableTest_profile2__includeName: Boolean!\n  $__RelayModernEnvironmentExecuteWithProvidedVariableTest_profile2__includeAlternateName: Boolean!\n  $__RelayModernEnvironmentExecuteWithProvidedVariableTest_profile3__profilePictureScale: Float!\n) {\n  node(id: $id) {\n    __typename\n    ...RelayModernEnvironmentExecuteWithProvidedVariableTest_profile1\n    ...RelayModernEnvironmentExecuteWithProvidedVariableTest_profile2\n    ...RelayModernEnvironmentExecuteWithProvidedVariableTest_profile3\n    id\n  }\n}\n\nfragment RelayModernEnvironmentExecuteWithProvidedVariableTest_profile1 on User {\n  id\n  name @include(if: $__RelayModernEnvironmentExecuteWithProvidedVariableTest_profile1__includeName)\n  username @skip(if: $__RelayModernEnvironmentExecuteWithProvidedVariableTest_profile1__skipUsername)\n  profilePicture {\n    uri\n  }\n}\n\nfragment RelayModernEnvironmentExecuteWithProvidedVariableTest_profile2 on User {\n  name @include(if: $__RelayModernEnvironmentExecuteWithProvidedVariableTest_profile2__includeName)\n  alternate_name @include(if: $__RelayModernEnvironmentExecuteWithProvidedVariableTest_profile2__includeAlternateName)\n}\n\nfragment RelayModernEnvironmentExecuteWithProvidedVariableTest_profile3 on User {\n  profile_picture(scale: $__RelayModernEnvironmentExecuteWithProvidedVariableTest_profile3__profilePictureScale) {\n    uri\n  }\n}\n",
    "providedVariables": {
      "__RelayModernEnvironmentExecuteWithProvidedVariableTest_profile1__includeName": require('./../RelayProvider_returnsTrue'),
      "__RelayModernEnvironmentExecuteWithProvidedVariableTest_profile1__skipUsername": require('./../RelayProvider_returnsTrue'),
      "__RelayModernEnvironmentExecuteWithProvidedVariableTest_profile2__includeName": require('./../RelayProvider_returnsTrue'),
      "__RelayModernEnvironmentExecuteWithProvidedVariableTest_profile2__includeAlternateName": require('./../RelayProvider_returnsTrue'),
      "__RelayModernEnvironmentExecuteWithProvidedVariableTest_profile3__profilePictureScale": require('./../RelayProvider_pictureScale')
    }
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "354b41b8063702301345c74af4c434f7";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentExecuteWithProvidedVariableTest_UserArgManyFragmentsQuery$variables,
  RelayModernEnvironmentExecuteWithProvidedVariableTest_UserArgManyFragmentsQuery$data,
>*/);
