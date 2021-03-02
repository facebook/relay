/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<dd2e94f9e32010f41e6c5214625a9b30>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
type RelayReaderTestShouldConsiderDataMissingIfTheFragmentIsConcreteButOnTheRootRootFragment$ref = any;
export type RelayReaderTestShouldConsiderDataMissingIfTheFragmentIsConcreteButOnTheRootQueryVariables = {||};
export type RelayReaderTestShouldConsiderDataMissingIfTheFragmentIsConcreteButOnTheRootQueryResponse = {|
  +$fragmentRefs: RelayReaderTestShouldConsiderDataMissingIfTheFragmentIsConcreteButOnTheRootRootFragment$ref,
|};
export type RelayReaderTestShouldConsiderDataMissingIfTheFragmentIsConcreteButOnTheRootQuery = {|
  variables: RelayReaderTestShouldConsiderDataMissingIfTheFragmentIsConcreteButOnTheRootQueryVariables,
  response: RelayReaderTestShouldConsiderDataMissingIfTheFragmentIsConcreteButOnTheRootQueryResponse,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderTestShouldConsiderDataMissingIfTheFragmentIsConcreteButOnTheRootQuery",
    "selections": [
      {
        "args": null,
        "kind": "FragmentSpread",
        "name": "RelayReaderTestShouldConsiderDataMissingIfTheFragmentIsConcreteButOnTheRootRootFragment"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayReaderTestShouldConsiderDataMissingIfTheFragmentIsConcreteButOnTheRootQuery",
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
    "cacheID": "da3cad89e68357efeecc324f501d5731",
    "id": null,
    "metadata": {},
    "name": "RelayReaderTestShouldConsiderDataMissingIfTheFragmentIsConcreteButOnTheRootQuery",
    "operationKind": "query",
    "text": "query RelayReaderTestShouldConsiderDataMissingIfTheFragmentIsConcreteButOnTheRootQuery {\n  ...RelayReaderTestShouldConsiderDataMissingIfTheFragmentIsConcreteButOnTheRootRootFragment\n}\n\nfragment RelayReaderTestShouldConsiderDataMissingIfTheFragmentIsConcreteButOnTheRootRootFragment on Query {\n  me {\n    name\n    id\n  }\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "5fb60f127148c85aab3f1d86296e2525";
}

module.exports = node;
