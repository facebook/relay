/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<0f33bb24106e4b1698636acd117e8975>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
type RelayModernStoreWithSubscriptionsUsingMapByIDTest2Fragment$ref = any;
export type RelayModernStoreWithSubscriptionsUsingMapByIDTest2QueryVariables = {|
  size: number,
|};
export type RelayModernStoreWithSubscriptionsUsingMapByIDTest2QueryResponse = {|
  +me: ?{|
    +$fragmentRefs: RelayModernStoreWithSubscriptionsUsingMapByIDTest2Fragment$ref,
  |},
|};
export type RelayModernStoreWithSubscriptionsUsingMapByIDTest2Query = {|
  variables: RelayModernStoreWithSubscriptionsUsingMapByIDTest2QueryVariables,
  response: RelayModernStoreWithSubscriptionsUsingMapByIDTest2QueryResponse,
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
    "name": "RelayModernStoreWithSubscriptionsUsingMapByIDTest2Query",
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
            "name": "RelayModernStoreWithSubscriptionsUsingMapByIDTest2Fragment"
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
    "name": "RelayModernStoreWithSubscriptionsUsingMapByIDTest2Query",
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
            "name": "emailAddresses",
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
    "cacheID": "1dcdc2d238f0bb0348813c5652d57785",
    "id": null,
    "metadata": {},
    "name": "RelayModernStoreWithSubscriptionsUsingMapByIDTest2Query",
    "operationKind": "query",
    "text": "query RelayModernStoreWithSubscriptionsUsingMapByIDTest2Query(\n  $size: Float!\n) {\n  me {\n    ...RelayModernStoreWithSubscriptionsUsingMapByIDTest2Fragment\n    id\n  }\n}\n\nfragment RelayModernStoreWithSubscriptionsUsingMapByIDTest2Fragment on User {\n  name\n  profilePicture(size: $size) {\n    uri\n  }\n  emailAddresses\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "96b3f1eb3452c71ceb0f14036825bb14";
}

module.exports = node;
