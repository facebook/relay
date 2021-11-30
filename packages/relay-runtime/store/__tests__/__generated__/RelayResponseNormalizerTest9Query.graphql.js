/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<e1f101df78db3190d41e18bcc10f42e4>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayResponseNormalizerTest5Fragment$fragmentType = any;
export type RelayResponseNormalizerTest9Query$variables = {|
  id: string,
|};
export type RelayResponseNormalizerTest9QueryVariables = RelayResponseNormalizerTest9Query$variables;
export type RelayResponseNormalizerTest9Query$data = {|
  +node: ?{|
    +actors?: ?$ReadOnlyArray<?{|
      +$fragmentSpreads: RelayResponseNormalizerTest5Fragment$fragmentType,
    |}>,
  |},
|};
export type RelayResponseNormalizerTest9QueryResponse = RelayResponseNormalizerTest9Query$data;
export type RelayResponseNormalizerTest9Query = {|
  variables: RelayResponseNormalizerTest9QueryVariables,
  response: RelayResponseNormalizerTest9Query$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayResponseNormalizerTest9Query",
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
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "actors",
                "plural": true,
                "selections": [
                  {
                    "kind": "Defer",
                    "selections": [
                      {
                        "args": null,
                        "kind": "FragmentSpread",
                        "name": "RelayResponseNormalizerTest5Fragment"
                      }
                    ]
                  }
                ],
                "storageKey": null
              }
            ],
            "type": "Feedback",
            "abstractKey": null
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RelayResponseNormalizerTest9Query",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "actors",
                "plural": true,
                "selections": [
                  (v2/*: any*/),
                  {
                    "if": null,
                    "kind": "Defer",
                    "label": "RelayResponseNormalizerTest9Query$defer$TestFragment",
                    "selections": [
                      {
                        "kind": "InlineFragment",
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "name",
                            "storageKey": null
                          }
                        ],
                        "type": "User",
                        "abstractKey": null
                      }
                    ]
                  },
                  (v3/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "type": "Feedback",
            "abstractKey": null
          },
          (v3/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "8f41cf2437f6a60e7a09cdf15c9af01f",
    "id": null,
    "metadata": {},
    "name": "RelayResponseNormalizerTest9Query",
    "operationKind": "query",
    "text": "query RelayResponseNormalizerTest9Query(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ... on Feedback {\n      actors {\n        __typename\n        ...RelayResponseNormalizerTest5Fragment @defer(label: \"RelayResponseNormalizerTest9Query$defer$TestFragment\", if: true)\n        id\n      }\n    }\n    id\n  }\n}\n\nfragment RelayResponseNormalizerTest5Fragment on User {\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "f2dffeabae2388e74241a6adde2168d4";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayResponseNormalizerTest9Query$variables,
  RelayResponseNormalizerTest9Query$data,
>*/);
