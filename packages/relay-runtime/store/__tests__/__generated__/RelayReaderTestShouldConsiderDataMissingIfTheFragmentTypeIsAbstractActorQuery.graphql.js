/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<eabc6e98f27c3b690bc5deb454386011>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
type RelayReaderTestShouldConsiderDataMissingIfTheFragmentTypeIsAbstractActorProfile$ref = any;
export type RelayReaderTestShouldConsiderDataMissingIfTheFragmentTypeIsAbstractActorQueryVariables = {||};
export type RelayReaderTestShouldConsiderDataMissingIfTheFragmentTypeIsAbstractActorQueryResponse = {|
  +viewer: ?{|
    +actor: ?{|
      +$fragmentRefs: RelayReaderTestShouldConsiderDataMissingIfTheFragmentTypeIsAbstractActorProfile$ref,
    |},
  |},
|};
export type RelayReaderTestShouldConsiderDataMissingIfTheFragmentTypeIsAbstractActorQuery = {|
  variables: RelayReaderTestShouldConsiderDataMissingIfTheFragmentTypeIsAbstractActorQueryVariables,
  response: RelayReaderTestShouldConsiderDataMissingIfTheFragmentTypeIsAbstractActorQueryResponse,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderTestShouldConsiderDataMissingIfTheFragmentTypeIsAbstractActorQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Viewer",
        "kind": "LinkedField",
        "name": "viewer",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "actor",
            "plural": false,
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "RelayReaderTestShouldConsiderDataMissingIfTheFragmentTypeIsAbstractActorProfile"
              }
            ],
            "storageKey": null
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
    "name": "RelayReaderTestShouldConsiderDataMissingIfTheFragmentTypeIsAbstractActorQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Viewer",
        "kind": "LinkedField",
        "name": "viewer",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "actor",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "__typename",
                "storageKey": null
              },
              {
                "kind": "TypeDiscriminator",
                "abstractKey": "__isActor"
              },
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
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "7f4be7629c6115c819ec5617cbebe902",
    "id": null,
    "metadata": {},
    "name": "RelayReaderTestShouldConsiderDataMissingIfTheFragmentTypeIsAbstractActorQuery",
    "operationKind": "query",
    "text": "query RelayReaderTestShouldConsiderDataMissingIfTheFragmentTypeIsAbstractActorQuery {\n  viewer {\n    actor {\n      __typename\n      ...RelayReaderTestShouldConsiderDataMissingIfTheFragmentTypeIsAbstractActorProfile\n      id\n    }\n  }\n}\n\nfragment RelayReaderTestShouldConsiderDataMissingIfTheFragmentTypeIsAbstractActorProfile on Actor {\n  __isActor: __typename\n  name\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "4b700c3225c0e3ab4f6a4eec8276a452";
}

module.exports = node;
