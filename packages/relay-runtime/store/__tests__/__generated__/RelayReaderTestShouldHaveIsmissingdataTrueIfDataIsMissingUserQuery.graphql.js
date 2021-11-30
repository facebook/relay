/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<646373ef0a37e7953c097be85ed57d1d>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingUserProfile$fragmentType = any;
export type RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingUserQuery$variables = {||};
export type RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingUserQueryVariables = RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingUserQuery$variables;
export type RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingUserQuery$data = {|
  +me: ?{|
    +$fragmentSpreads: RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingUserProfile$fragmentType,
  |},
|};
export type RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingUserQueryResponse = RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingUserQuery$data;
export type RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingUserQuery = {|
  variables: RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingUserQueryVariables,
  response: RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingUserQuery$data,
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

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingUserQuery$variables,
  RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingUserQuery$data,
>*/);
