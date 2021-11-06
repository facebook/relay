/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<5aed5f924c2236cdd08c92a44e99561c>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
type RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingUserProfile$ref = any;
export type RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingUserQueryVariables = {||};
export type RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingUserQueryResponse = {|
  +me: ?{|
    +$fragmentRefs: RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingUserProfile$ref,
  |},
|};
export type RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingUserQuery = {|
  variables: RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingUserQueryVariables,
  response: RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingUserQueryResponse,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingUserQuery",
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
            "name": "RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingUserProfile"
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
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingUserQuery",
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
            "args": null,
            "kind": "ScalarField",
            "name": "username",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "008c512b807fd23529e2b93ba7efd2bb",
    "id": null,
    "metadata": {},
    "name": "RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingUserQuery",
    "operationKind": "query",
    "text": "query RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingUserQuery {\n  me {\n    ...RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingUserProfile\n    id\n  }\n}\n\nfragment RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingUserProfile on User {\n  id\n  username\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "b8bb895c4bc3c32d92456c0798ef49ed";
}

module.exports = node;
