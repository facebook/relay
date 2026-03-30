/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<239cb79883358b829f39a24ccff70f57>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayResponseNormalizerTest2Fragment$fragmentType } from "./RelayResponseNormalizerTest2Fragment.graphql";
export type RelayResponseNormalizerTest6Query$variables = {|
  enableDefer: boolean,
  id: string,
|};
export type RelayResponseNormalizerTest6Query$data = {|
  +node: ?{|
    +$fragmentSpreads: RelayResponseNormalizerTest2Fragment$fragmentType,
  |},
|};
export type RelayResponseNormalizerTest6Query = {|
  response: RelayResponseNormalizerTest6Query$data,
  variables: RelayResponseNormalizerTest6Query$variables,
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
      (v0/*:: as any*/),
      (v1/*:: as any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayResponseNormalizerTest6Query",
    "selections": [
      {
        "alias": null,
        "args": (v2/*:: as any*/),
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
      (v1/*:: as any*/),
      (v0/*:: as any*/)
    ],
    "kind": "Operation",
    "name": "RelayResponseNormalizerTest6Query",
    "selections": [
      {
        "alias": null,
        "args": (v2/*:: as any*/),
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
                  (v3/*:: as any*/),
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
          (v3/*:: as any*/)
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
  (node/*:: as any*/).hash = "391601564014900fbc9cceac74ffdcda";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  RelayResponseNormalizerTest6Query$variables,
  RelayResponseNormalizerTest6Query$data,
>*/);
