/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<3cca0f3c1169fd0d829eed602c7c1cf0>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayResponseNormalizerTest2Fragment$fragmentType = any;
export type RelayResponseNormalizerTest6Query$variables = {|
  id: string,
  enableDefer: boolean,
|};
export type RelayResponseNormalizerTest6QueryVariables = RelayResponseNormalizerTest6Query$variables;
export type RelayResponseNormalizerTest6Query$data = {|
  +node: ?{|
    +$fragmentSpreads: RelayResponseNormalizerTest2Fragment$fragmentType,
  |},
|};
export type RelayResponseNormalizerTest6QueryResponse = RelayResponseNormalizerTest6Query$data;
export type RelayResponseNormalizerTest6Query = {|
  variables: RelayResponseNormalizerTest6QueryVariables,
  response: RelayResponseNormalizerTest6Query$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "enableDefer"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "id"
},
v2 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
],
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayResponseNormalizerTest6Query",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "kind": "Defer",
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "RelayResponseNormalizerTest2Fragment"
              }
            ]
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
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "RelayResponseNormalizerTest6Query",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
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
            "if": "enableDefer",
            "kind": "Defer",
            "label": "RelayResponseNormalizerTest6Query$defer$TestFragment",
            "selections": [
              {
                "kind": "InlineFragment",
                "selections": [
                  (v3/*: any*/),
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
    ]
  },
  "params": {
    "cacheID": "89fa377224a78ba61a731eaeb282d885",
    "id": null,
    "metadata": {},
    "name": "RelayResponseNormalizerTest6Query",
    "operationKind": "query",
    "text": "query RelayResponseNormalizerTest6Query(\n  $id: ID!\n  $enableDefer: Boolean!\n) {\n  node(id: $id) {\n    __typename\n    ...RelayResponseNormalizerTest2Fragment @defer(label: \"RelayResponseNormalizerTest6Query$defer$TestFragment\", if: $enableDefer)\n    id\n  }\n}\n\nfragment RelayResponseNormalizerTest2Fragment on User {\n  id\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "6d72ae05b718f7c9fee011a92865e4b5";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayResponseNormalizerTest6Query$variables,
  RelayResponseNormalizerTest6Query$data,
>*/);
