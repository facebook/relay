/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<43fdcb51f0c8c5226fbb0556c5714263>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
type RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableProfilePicture$ref = any;
export type RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableUserQueryVariables = {|
  size?: ?$ReadOnlyArray<?number>,
|};
export type RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableUserQueryResponse = {|
  +me: ?{|
    +$fragmentRefs: RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableProfilePicture$ref,
  |},
|};
export type RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableUserQuery = {|
  variables: RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableUserQueryVariables,
  response: RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableUserQueryResponse,
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

module.exports = node;
