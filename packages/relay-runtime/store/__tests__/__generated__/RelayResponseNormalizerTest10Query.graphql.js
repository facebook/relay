/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<2db8f71a47fd8229ec2bcb89c5f7a904>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayResponseNormalizerTest6Fragment$fragmentType = any;
export type RelayResponseNormalizerTest10Query$variables = {|
  id: string,
|};
export type RelayResponseNormalizerTest10QueryVariables = RelayResponseNormalizerTest10Query$variables;
export type RelayResponseNormalizerTest10Query$data = {|
  +node: ?{|
    +$fragmentSpreads: RelayResponseNormalizerTest6Fragment$fragmentType,
  |},
|};
export type RelayResponseNormalizerTest10QueryResponse = RelayResponseNormalizerTest10Query$data;
export type RelayResponseNormalizerTest10Query = {|
  variables: RelayResponseNormalizerTest10QueryVariables,
  response: RelayResponseNormalizerTest10Query$data,
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
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayResponseNormalizerTest10Query",
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
            "kind": "Defer",
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "RelayResponseNormalizerTest6Fragment"
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RelayResponseNormalizerTest10Query",
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
            "if": null,
            "kind": "Defer",
            "label": "RelayResponseNormalizerTest10Query$defer$TestFragment",
            "selections": [
              {
                "kind": "InlineFragment",
                "selections": [
                  (v2/*: any*/),
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
          (v2/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "6ccf03e978b6a9467ef3996b337cf107",
    "id": null,
    "metadata": {},
    "name": "RelayResponseNormalizerTest10Query",
    "operationKind": "query",
    "text": "query RelayResponseNormalizerTest10Query(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...RelayResponseNormalizerTest6Fragment @defer(label: \"RelayResponseNormalizerTest10Query$defer$TestFragment\")\n    id\n  }\n}\n\nfragment RelayResponseNormalizerTest6Fragment on User {\n  id\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "25cdf6541b8272d4a77a346d81a442eb";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayResponseNormalizerTest10Query$variables,
  RelayResponseNormalizerTest10Query$data,
>*/);
