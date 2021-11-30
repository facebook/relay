/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<ac29ed60e2d8e3afb2c3ee44033af5dd>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableProfilePicture$fragmentType = any;
export type RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableUserQuery$variables = {|
  size?: ?$ReadOnlyArray<?number>,
|};
export type RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableUserQueryVariables = RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableUserQuery$variables;
export type RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableUserQuery$data = {|
  +me: ?{|
    +$fragmentSpreads: RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableProfilePicture$fragmentType,
  |},
|};
export type RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableUserQueryResponse = RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableUserQuery$data;
export type RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableUserQuery = {|
  variables: RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableUserQueryVariables,
  response: RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableUserQuery$data,
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
    "name": "RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableUserQuery",
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
            "name": "RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableProfilePicture"
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
    "name": "RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableUserQuery",
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
            "name": "id",
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
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "2de92300985a70724088552f4b7d8296",
    "id": null,
    "metadata": {},
    "name": "RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableUserQuery",
    "operationKind": "query",
    "text": "query RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableUserQuery(\n  $size: [Int]\n) {\n  me {\n    ...RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableProfilePicture\n    id\n  }\n}\n\nfragment RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableProfilePicture on User {\n  id\n  profilePicture(size: $size) {\n    uri\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "e67bfc897e5efd72ca5ee4c64e78e016";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableUserQuery$variables,
  RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableUserQuery$data,
>*/);
