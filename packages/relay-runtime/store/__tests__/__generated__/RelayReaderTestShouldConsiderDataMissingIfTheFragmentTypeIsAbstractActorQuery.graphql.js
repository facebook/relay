/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<bfba94efb982186022ade1df5d84fdbe>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayReaderTestShouldConsiderDataMissingIfTheFragmentTypeIsAbstractActorProfile$fragmentType = any;
export type RelayReaderTestShouldConsiderDataMissingIfTheFragmentTypeIsAbstractActorQuery$variables = {||};
export type RelayReaderTestShouldConsiderDataMissingIfTheFragmentTypeIsAbstractActorQueryVariables = RelayReaderTestShouldConsiderDataMissingIfTheFragmentTypeIsAbstractActorQuery$variables;
export type RelayReaderTestShouldConsiderDataMissingIfTheFragmentTypeIsAbstractActorQuery$data = {|
  +viewer: ?{|
    +actor: ?{|
      +$fragmentSpreads: RelayReaderTestShouldConsiderDataMissingIfTheFragmentTypeIsAbstractActorProfile$fragmentType,
    |},
  |},
|};
export type RelayReaderTestShouldConsiderDataMissingIfTheFragmentTypeIsAbstractActorQueryResponse = RelayReaderTestShouldConsiderDataMissingIfTheFragmentTypeIsAbstractActorQuery$data;
export type RelayReaderTestShouldConsiderDataMissingIfTheFragmentTypeIsAbstractActorQuery = {|
  variables: RelayReaderTestShouldConsiderDataMissingIfTheFragmentTypeIsAbstractActorQueryVariables,
  response: RelayReaderTestShouldConsiderDataMissingIfTheFragmentTypeIsAbstractActorQuery$data,
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

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderTestShouldConsiderDataMissingIfTheFragmentTypeIsAbstractActorQuery$variables,
  RelayReaderTestShouldConsiderDataMissingIfTheFragmentTypeIsAbstractActorQuery$data,
>*/);
