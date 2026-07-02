/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<d5bad07e2bab506cbbdd342962238929>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { withProvidedVariablesTest7Fragment$fragmentType } from "./withProvidedVariablesTest7Fragment.graphql";
export type withProvidedVariablesTest7Query$variables = {};
export type withProvidedVariablesTest7Query$data = {
  readonly node: ?{
    readonly $fragmentSpreads: withProvidedVariablesTest7Fragment$fragmentType,
  },
};
export type withProvidedVariablesTest7Query = {
  response: withProvidedVariablesTest7Query$data,
  variables: withProvidedVariablesTest7Query$variables,
};
({
  "__relay_internal__pv__provideDynamicValuerelayprovider": require('../provideDynamicValue.relayprovider')
} as {
  readonly __relay_internal__pv__provideDynamicValuerelayprovider: {
    readonly dynamic?: boolean,
    readonly get: () => number,
  },
});
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
    "name": "withProvidedVariablesTest7Query",
    "selections": [
      {
        "alias": null,
        "args": (v0/*:: as any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "withProvidedVariablesTest7Fragment"
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
        "name": "__relay_internal__pv__provideDynamicValuerelayprovider"
      }
    ],
    "kind": "Operation",
    "name": "withProvidedVariablesTest7Query",
    "selections": [
      {
        "alias": null,
        "args": (v0/*:: as any*/),
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
                    "variableName": "__relay_internal__pv__provideDynamicValuerelayprovider"
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
    "cacheID": "cccc8d13add9921b3325b27527df8a08",
    "id": null,
    "metadata": {},
    "name": "withProvidedVariablesTest7Query",
    "operationKind": "query",
    "text": "query withProvidedVariablesTest7Query(\n  $__relay_internal__pv__provideDynamicValuerelayprovider: Float!\n) {\n  node(id: 4) {\n    __typename\n    ...withProvidedVariablesTest7Fragment\n    id\n  }\n}\n\nfragment withProvidedVariablesTest7Fragment on User {\n  profile_picture(scale: $__relay_internal__pv__provideDynamicValuerelayprovider) {\n    uri\n  }\n}\n",
    "providedVariables": {
      "__relay_internal__pv__provideDynamicValuerelayprovider": require('../provideDynamicValue.relayprovider')
    }
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "38546e2e378acd0148f4293aa159519c";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  withProvidedVariablesTest7Query$variables,
  withProvidedVariablesTest7Query$data,
>*/);
