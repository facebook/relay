/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<75184f234c860e4411f9f7dcc769b7a4>>
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
  +__pv__provideRandomNumber_invalid1: {|
    +get: () => number,
  |},
|};
*/

var providedVariableProviders/*: ProvidedVariableProviderType*/ = {
  "__pv__provideRandomNumber_invalid1": require('./../provideRandomNumber_invalid1')
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
        "name": "__pv__provideRandomNumber_invalid1"
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
                    "variableName": "__pv__provideRandomNumber_invalid1"
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
    "cacheID": "ae2f5de01e60cd0ee2ac0dac867eed45",
    "id": null,
    "metadata": {},
    "name": "withProvidedVariablesTest6Query",
    "operationKind": "query",
    "text": "query withProvidedVariablesTest6Query(\n  $__pv__provideRandomNumber_invalid1: Float!\n) {\n  node(id: 4) {\n    __typename\n    ...withProvidedVariablesTest6Fragment\n    id\n  }\n}\n\nfragment withProvidedVariablesTest6Fragment on User {\n  profile_picture(scale: $__pv__provideRandomNumber_invalid1) {\n    uri\n  }\n}\n",
    "providedVariables": {
      "__pv__provideRandomNumber_invalid1": require('./../provideRandomNumber_invalid1')
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
