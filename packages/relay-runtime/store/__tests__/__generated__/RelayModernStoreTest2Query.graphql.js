/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<3c2e51265523be0dacb71730558a15d9>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayModernStoreTest2Fragment$fragmentType } from "./RelayModernStoreTest2Fragment.graphql";
export type RelayModernStoreTest2Query$variables = {|
  size?: ?ReadonlyArray<?number>,
|};
export type RelayModernStoreTest2Query$data = {|
  +me: ?{|
    +$fragmentSpreads: RelayModernStoreTest2Fragment$fragmentType,
  |},
|};
export type RelayModernStoreTest2Query = {|
  response: RelayModernStoreTest2Query$data,
  variables: RelayModernStoreTest2Query$variables,
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
    "name": "RelayModernStoreTest2Query",
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
            "name": "RelayModernStoreTest2Fragment"
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
    "name": "RelayModernStoreTest2Query",
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
            "name": "id",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "d17feed2051e50aacd4d559a0d751a99",
    "id": null,
    "metadata": {},
    "name": "RelayModernStoreTest2Query",
    "operationKind": "query",
    "text": "query RelayModernStoreTest2Query(\n  $size: [Int]\n) {\n  me {\n    ...RelayModernStoreTest2Fragment\n    id\n  }\n}\n\nfragment RelayModernStoreTest2Fragment on User {\n  name\n  profilePicture(size: $size) {\n    uri\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "e518168e115ad40886299a1906f0a863";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernStoreTest2Query$variables,
  RelayModernStoreTest2Query$data,
>*/);
