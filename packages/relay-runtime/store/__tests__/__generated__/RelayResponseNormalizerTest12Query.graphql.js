/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<8df0af8318efcd2f87d077cf51539338>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayResponseNormalizerTest9Fragment$fragmentType = any;
export type RelayResponseNormalizerTest12Query$variables = {|
  id: string,
  enableStream: boolean,
|};
export type RelayResponseNormalizerTest12QueryVariables = RelayResponseNormalizerTest12Query$variables;
export type RelayResponseNormalizerTest12Query$data = {|
  +node: ?{|
    +$fragmentSpreads: RelayResponseNormalizerTest9Fragment$fragmentType,
  |},
|};
export type RelayResponseNormalizerTest12QueryResponse = RelayResponseNormalizerTest12Query$data;
export type RelayResponseNormalizerTest12Query = {|
  variables: RelayResponseNormalizerTest12QueryVariables,
  response: RelayResponseNormalizerTest12Query$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "enableStream"
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
  "name": "__typename",
  "storageKey": null
},
v4 = {
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
    "name": "RelayResponseNormalizerTest12Query",
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
            "args": null,
            "kind": "FragmentSpread",
            "name": "RelayResponseNormalizerTest9Fragment"
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
    "name": "RelayResponseNormalizerTest12Query",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v3/*: any*/),
          (v4/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "if": "enableStream",
                "kind": "Stream",
                "label": "RelayResponseNormalizerTest9Fragment$stream$actors",
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": null,
                    "kind": "LinkedField",
                    "name": "actors",
                    "plural": true,
                    "selections": [
                      (v3/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "name",
                        "storageKey": null
                      },
                      (v4/*: any*/)
                    ],
                    "storageKey": null
                  }
                ]
              }
            ],
            "type": "Feedback",
            "abstractKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "8ec2a976a02b998925f8be37f8fd1c3c",
    "id": null,
    "metadata": {},
    "name": "RelayResponseNormalizerTest12Query",
    "operationKind": "query",
    "text": "query RelayResponseNormalizerTest12Query(\n  $id: ID!\n  $enableStream: Boolean!\n) {\n  node(id: $id) {\n    __typename\n    ...RelayResponseNormalizerTest9Fragment\n    id\n  }\n}\n\nfragment RelayResponseNormalizerTest9Fragment on Feedback {\n  id\n  actors @stream(label: \"RelayResponseNormalizerTest9Fragment$stream$actors\", if: $enableStream, initial_count: 0) {\n    __typename\n    name\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "e2566f3cbdd63fc7ea2c74c81703d8e8";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayResponseNormalizerTest12Query$variables,
  RelayResponseNormalizerTest12Query$data,
>*/);
