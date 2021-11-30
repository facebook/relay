/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<9846212d4dc1e3c4a48e549f53608b0d>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayReaderTestReadsFragmentData$fragmentType = any;
export type RelayReaderTestReadsFragmentDataUserQuery$variables = {|
  size?: ?$ReadOnlyArray<?number>,
|};
export type RelayReaderTestReadsFragmentDataUserQueryVariables = RelayReaderTestReadsFragmentDataUserQuery$variables;
export type RelayReaderTestReadsFragmentDataUserQuery$data = {|
  +me: ?{|
    +$fragmentSpreads: RelayReaderTestReadsFragmentData$fragmentType,
  |},
|};
export type RelayReaderTestReadsFragmentDataUserQueryResponse = RelayReaderTestReadsFragmentDataUserQuery$data;
export type RelayReaderTestReadsFragmentDataUserQuery = {|
  variables: RelayReaderTestReadsFragmentDataUserQueryVariables,
  response: RelayReaderTestReadsFragmentDataUserQuery$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "size"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "size",
    "variableName": "size"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "firstName",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderTestReadsFragmentDataUserQuery",
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
            "args": (v1/*: any*/),
            "kind": "FragmentSpread",
            "name": "RelayReaderTestReadsFragmentData"
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
    "name": "RelayReaderTestReadsFragmentDataUserQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/),
          {
            "alias": null,
            "args": [
              {
                "kind": "Literal",
                "name": "first",
                "value": 3
              }
            ],
            "concreteType": "FriendsConnection",
            "kind": "LinkedField",
            "name": "friends",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "FriendsEdge",
                "kind": "LinkedField",
                "name": "edges",
                "plural": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "cursor",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "User",
                    "kind": "LinkedField",
                    "name": "node",
                    "plural": false,
                    "selections": [
                      (v2/*: any*/),
                      (v3/*: any*/)
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": "friends(first:3)"
          },
          {
            "alias": null,
            "args": (v1/*: any*/),
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
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "bb0983d51c5bdaf0ac74df9baa735885",
    "id": null,
    "metadata": {},
    "name": "RelayReaderTestReadsFragmentDataUserQuery",
    "operationKind": "query",
    "text": "query RelayReaderTestReadsFragmentDataUserQuery(\n  $size: [Int]\n) {\n  me {\n    ...RelayReaderTestReadsFragmentData_18PEfK\n    id\n  }\n}\n\nfragment RelayReaderTestReadsFragmentData_18PEfK on User {\n  id\n  firstName\n  friends(first: 3) {\n    edges {\n      cursor\n      node {\n        id\n        firstName\n      }\n    }\n  }\n  profilePicture(size: $size) {\n    uri\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "fb223466873df61d9c49e0d1eccba9e9";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderTestReadsFragmentDataUserQuery$variables,
  RelayReaderTestReadsFragmentDataUserQuery$data,
>*/);
