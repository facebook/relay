/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<34bd9ffc955c782f7e5871d6d90ed2a0>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { withProvidedVariablesTest5Fragment$fragmentType } from "./withProvidedVariablesTest5Fragment.graphql";
export type withProvidedVariablesTest5Query$variables = {||};
export type withProvidedVariablesTest5Query$data = {|
  +node: ?{|
    +$fragmentSpreads: withProvidedVariablesTest5Fragment$fragmentType,
  |},
|};
export type withProvidedVariablesTest5Query = {|
  response: withProvidedVariablesTest5Query$data,
  variables: withProvidedVariablesTest5Query$variables,
|};
({
  "__relay_internal__pv__provideRandomNumber_invalid1relayprovider": require('../provideRandomNumber_invalid1.relayprovider'),
  "__relay_internal__pv__provideRandomNumber_invalid2relayprovider": require('../provideRandomNumber_invalid2.relayprovider')
}: {|
  +__relay_internal__pv__provideRandomNumber_invalid1relayprovider: {|
    +get: () => number,
  |},
  +__relay_internal__pv__provideRandomNumber_invalid2relayprovider: {|
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
],
v1 = [
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
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "withProvidedVariablesTest5Query",
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
            "name": "withProvidedVariablesTest5Fragment"
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
      },
      {
        "defaultValue": null,
        "kind": "LocalArgument",
        "name": "__relay_internal__pv__provideRandomNumber_invalid2relayprovider"
      }
    ],
    "kind": "Operation",
    "name": "withProvidedVariablesTest5Query",
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
                "selections": (v1/*: any*/),
                "storageKey": null
              },
              {
                "alias": "other_picture",
                "args": [
                  {
                    "kind": "Variable",
                    "name": "scale",
                    "variableName": "__relay_internal__pv__provideRandomNumber_invalid2relayprovider"
                  }
                ],
                "concreteType": "Image",
                "kind": "LinkedField",
                "name": "profile_picture",
                "plural": false,
                "selections": (v1/*: any*/),
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
    "cacheID": "cda705fe366ac9a181f24d7fdd7bbda5",
    "id": null,
    "metadata": {},
    "name": "withProvidedVariablesTest5Query",
    "operationKind": "query",
    "text": "query withProvidedVariablesTest5Query(\n  $__relay_internal__pv__provideRandomNumber_invalid1relayprovider: Float!\n  $__relay_internal__pv__provideRandomNumber_invalid2relayprovider: Float!\n) {\n  node(id: 4) {\n    __typename\n    ...withProvidedVariablesTest5Fragment\n    id\n  }\n}\n\nfragment withProvidedVariablesTest5Fragment on User {\n  profile_picture(scale: $__relay_internal__pv__provideRandomNumber_invalid1relayprovider) {\n    uri\n  }\n  other_picture: profile_picture(scale: $__relay_internal__pv__provideRandomNumber_invalid2relayprovider) {\n    uri\n  }\n}\n",
    "providedVariables": {
      "__relay_internal__pv__provideRandomNumber_invalid1relayprovider": require('../provideRandomNumber_invalid1.relayprovider'),
      "__relay_internal__pv__provideRandomNumber_invalid2relayprovider": require('../provideRandomNumber_invalid2.relayprovider')
    }
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "fea93f1b453b7ed30e1b62dc0b32bc4e";
}

module.exports = ((node/*: any*/)/*: Query<
  withProvidedVariablesTest5Query$variables,
  withProvidedVariablesTest5Query$data,
>*/);
