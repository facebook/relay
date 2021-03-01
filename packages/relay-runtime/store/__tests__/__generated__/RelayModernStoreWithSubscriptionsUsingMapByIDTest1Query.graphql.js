/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<38e944eb74ec0ea424d6a96713f8c89f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
type RelayModernStoreWithSubscriptionsUsingMapByIDTest1Fragment$ref = any;
export type RelayModernStoreWithSubscriptionsUsingMapByIDTest1QueryVariables = {|
  size?: ?number,
|};
export type RelayModernStoreWithSubscriptionsUsingMapByIDTest1QueryResponse = {|
  +me: ?{|
    +$fragmentRefs: RelayModernStoreWithSubscriptionsUsingMapByIDTest1Fragment$ref,
  |},
|};
export type RelayModernStoreWithSubscriptionsUsingMapByIDTest1Query = {|
  variables: RelayModernStoreWithSubscriptionsUsingMapByIDTest1QueryVariables,
  response: RelayModernStoreWithSubscriptionsUsingMapByIDTest1QueryResponse,
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
    "name": "RelayModernStoreWithSubscriptionsUsingMapByIDTest1Query",
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
            "name": "RelayModernStoreWithSubscriptionsUsingMapByIDTest1Fragment"
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
    "name": "RelayModernStoreWithSubscriptionsUsingMapByIDTest1Query",
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
    "cacheID": "9a1654735d5b3c16fdd8e7a8571ca9d0",
    "id": null,
    "metadata": {},
    "name": "RelayModernStoreWithSubscriptionsUsingMapByIDTest1Query",
    "operationKind": "query",
    "text": "query RelayModernStoreWithSubscriptionsUsingMapByIDTest1Query(\n  $size: Int\n) {\n  me {\n    ...RelayModernStoreWithSubscriptionsUsingMapByIDTest1Fragment\n    id\n  }\n}\n\nfragment RelayModernStoreWithSubscriptionsUsingMapByIDTest1Fragment on User {\n  name\n  profilePicture(size: $size) {\n    uri\n  }\n  emailAddresses\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "bb798bdd1f5843759f02b58addd62bbd";
}

module.exports = node;
