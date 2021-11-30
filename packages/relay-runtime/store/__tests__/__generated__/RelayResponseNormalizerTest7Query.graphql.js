/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<08af7a7249183faeac672fae43e5ec7e>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayResponseNormalizerTest3Fragment$fragmentType = any;
export type RelayResponseNormalizerTest7Query$variables = {|
  id: string,
|};
export type RelayResponseNormalizerTest7QueryVariables = RelayResponseNormalizerTest7Query$variables;
export type RelayResponseNormalizerTest7Query$data = {|
  +node: ?{|
    +$fragmentSpreads: RelayResponseNormalizerTest3Fragment$fragmentType,
  |},
|};
export type RelayResponseNormalizerTest7QueryResponse = RelayResponseNormalizerTest7Query$data;
export type RelayResponseNormalizerTest7Query = {|
  variables: RelayResponseNormalizerTest7QueryVariables,
  response: RelayResponseNormalizerTest7Query$data,
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
    "name": "RelayResponseNormalizerTest7Query",
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
                "name": "RelayResponseNormalizerTest3Fragment"
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
    "name": "RelayResponseNormalizerTest7Query",
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
            "label": "RelayResponseNormalizerTest7Query$defer$TestFragment",
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
    "cacheID": "b67aded1ca6199f37b79ec3ed15a8ba3",
    "id": null,
    "metadata": {},
    "name": "RelayResponseNormalizerTest7Query",
    "operationKind": "query",
    "text": "query RelayResponseNormalizerTest7Query(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...RelayResponseNormalizerTest3Fragment @defer(label: \"RelayResponseNormalizerTest7Query$defer$TestFragment\", if: true)\n    id\n  }\n}\n\nfragment RelayResponseNormalizerTest3Fragment on User {\n  id\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "1b55aa70053112dca44375471deb0e3d";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayResponseNormalizerTest7Query$variables,
  RelayResponseNormalizerTest7Query$data,
>*/);
