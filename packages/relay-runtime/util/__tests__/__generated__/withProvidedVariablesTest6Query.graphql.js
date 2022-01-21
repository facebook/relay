/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<a262c7e60850a8ad1c2661dacdfa1c05>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type withProvidedVariablesTest6Fragment$fragmentType = any;
export type withProvidedVariablesTest6Query$variables = {||};
export type withProvidedVariablesTest6QueryVariables = withProvidedVariablesTest6Query$variables;
export type withProvidedVariablesTest6Query$data = {|
  +node: ?{|
    +$fragmentSpreads: withProvidedVariablesTest6Fragment$fragmentType,
  |},
|};
export type withProvidedVariablesTest6QueryResponse = withProvidedVariablesTest6Query$data;
export type withProvidedVariablesTest6Query = {|
  variables: withProvidedVariablesTest6QueryVariables,
  response: withProvidedVariablesTest6Query$data,
|};
type ProvidedVariableProviderType = {|
  +__relay_internal__pv__provideRandomNumber_invalid1: {|
    +get: () => number,
  |},
|};
*/

var providedVariableProviders/*: ProvidedVariableProviderType*/ = {
  "__relay_internal__pv__provideRandomNumber_invalid1": require('./../provideRandomNumber_invalid1')
};

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
    "name": "withProvidedVariablesTest6Query",
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
            "name": "withProvidedVariablesTest6Fragment"
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
        "name": "__relay_internal__pv__provideRandomNumber_invalid1"
      }
    ],
    "kind": "Operation",
    "name": "withProvidedVariablesTest6Query",
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
                    "name": "scale",
                    "variableName": "__relay_internal__pv__provideRandomNumber_invalid1"
                  }
                ],
                "concreteType": "Image",
                "kind": "LinkedField",
                "name": "profile_picture",
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
    "cacheID": "fcf5dcc928e30119f23979bad57cec14",
    "id": null,
    "metadata": {},
    "name": "withProvidedVariablesTest6Query",
    "operationKind": "query",
    "text": "query withProvidedVariablesTest6Query(\n  $__relay_internal__pv__provideRandomNumber_invalid1: Float!\n) {\n  node(id: 4) {\n    __typename\n    ...withProvidedVariablesTest6Fragment\n    id\n  }\n}\n\nfragment withProvidedVariablesTest6Fragment on User {\n  profile_picture(scale: $__relay_internal__pv__provideRandomNumber_invalid1) {\n    uri\n  }\n}\n",
    "providedVariables": {
      "__relay_internal__pv__provideRandomNumber_invalid1": require('./../provideRandomNumber_invalid1')
    }
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "8c7f3de6f49184530628833ac9970eef";
}

module.exports = ((node/*: any*/)/*: Query<
  withProvidedVariablesTest6Query$variables,
  withProvidedVariablesTest6Query$data,
>*/);
