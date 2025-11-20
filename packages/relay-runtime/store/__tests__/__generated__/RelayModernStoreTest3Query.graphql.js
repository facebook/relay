/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<c55723be9d74b9539fb6f26b9b4394f9>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayModernStoreTest3Fragment$fragmentType } from "./RelayModernStoreTest3Fragment.graphql";
export type RelayModernStoreTest3Query$variables = {|
  size?: ?ReadonlyArray<?number>,
|};
export type RelayModernStoreTest3Query$data = {|
  +me: ?{|
    +$fragmentSpreads: RelayModernStoreTest3Fragment$fragmentType,
  |},
|};
export type RelayModernStoreTest3Query = {|
  response: RelayModernStoreTest3Query$data,
  variables: RelayModernStoreTest3Query$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "size"
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernStoreTest3Query",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "RelayModernStoreTest3Fragment"
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
    "name": "RelayModernStoreTest3Query",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "name",
            "storageKey": null
          },
          {
            "alias": null,
            "args": [
              {
                "kind": "Variable",
                "name": "size",
                "variableName": "size"
              }
            ],
            "concreteType": "Image",
            "kind": "LinkedField",
            "name": "profilePicture",
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
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "username",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "68091ccab7763ede9c533038fb241f56",
    "id": null,
    "metadata": {},
    "name": "RelayModernStoreTest3Query",
    "operationKind": "query",
    "text": "query RelayModernStoreTest3Query(\n  $size: [Int]\n) {\n  me {\n    ...RelayModernStoreTest3Fragment\n    id\n  }\n}\n\nfragment RelayModernStoreTest3Fragment on User {\n  name\n  profilePicture(size: $size) {\n    uri\n  }\n  ...RelayModernStoreTest4Fragment\n}\n\nfragment RelayModernStoreTest4Fragment on User {\n  username\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "6816c9dd90cf08c7c3a1cb730f0b6165";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernStoreTest3Query$variables,
  RelayModernStoreTest3Query$data,
>*/);
