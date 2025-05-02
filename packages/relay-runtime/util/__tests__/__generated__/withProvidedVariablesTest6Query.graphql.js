/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<fa773c7429f03e53aba8a48166a7793b>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { withProvidedVariablesTest6Fragment$fragmentType } from "./withProvidedVariablesTest6Fragment.graphql";
export type withProvidedVariablesTest6Query$variables = {||};
export type withProvidedVariablesTest6Query$data = {|
  +node: ?{|
    +$fragmentSpreads: withProvidedVariablesTest6Fragment$fragmentType,
  |},
|};
export type withProvidedVariablesTest6Query = {|
  response: withProvidedVariablesTest6Query$data,
  variables: withProvidedVariablesTest6Query$variables,
|};
({
  "__relay_internal__pv__provideRandomNumber_invalid1relayprovider": require('../provideRandomNumber_invalid1.relayprovider')
}: {|
  +__relay_internal__pv__provideRandomNumber_invalid1relayprovider: {|
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
        "name": "__relay_internal__pv__provideRandomNumber_invalid1relayprovider"
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
                    "variableName": "__relay_internal__pv__provideRandomNumber_invalid1relayprovider"
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
    "cacheID": "6dd170bdd08456e241d43158af4d2ebd",
    "id": null,
    "metadata": {},
    "name": "withProvidedVariablesTest6Query",
    "operationKind": "query",
    "text": "query withProvidedVariablesTest6Query(\n  $__relay_internal__pv__provideRandomNumber_invalid1relayprovider: Float!\n) {\n  node(id: 4) {\n    __typename\n    ...withProvidedVariablesTest6Fragment\n    id\n  }\n}\n\nfragment withProvidedVariablesTest6Fragment on User {\n  profile_picture(scale: $__relay_internal__pv__provideRandomNumber_invalid1relayprovider) {\n    uri\n  }\n}\n",
    "providedVariables": {
      "__relay_internal__pv__provideRandomNumber_invalid1relayprovider": require('../provideRandomNumber_invalid1.relayprovider')
    }
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "4f2c4062537ffda1cddd4cb6b75b6bfa";
}

module.exports = ((node/*: any*/)/*: Query<
  withProvidedVariablesTest6Query$variables,
  withProvidedVariablesTest6Query$data,
>*/);
