/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<b21269daade24e2eecae04ac6bfc2fe3>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayReaderTestDoesNotRecordADependencyOnTypeRecordsForAbstractTypeDiscriminatorsFragment$fragmentType = any;
export type RelayReaderTestDoesNotRecordADependencyOnTypeRecordsForAbstractTypeDiscriminatorsQuery$variables = {||};
export type RelayReaderTestDoesNotRecordADependencyOnTypeRecordsForAbstractTypeDiscriminatorsQueryVariables = RelayReaderTestDoesNotRecordADependencyOnTypeRecordsForAbstractTypeDiscriminatorsQuery$variables;
export type RelayReaderTestDoesNotRecordADependencyOnTypeRecordsForAbstractTypeDiscriminatorsQuery$data = {|
  +me: ?{|
    +$fragmentSpreads: RelayReaderTestDoesNotRecordADependencyOnTypeRecordsForAbstractTypeDiscriminatorsFragment$fragmentType,
  |},
|};
export type RelayReaderTestDoesNotRecordADependencyOnTypeRecordsForAbstractTypeDiscriminatorsQueryResponse = RelayReaderTestDoesNotRecordADependencyOnTypeRecordsForAbstractTypeDiscriminatorsQuery$data;
export type RelayReaderTestDoesNotRecordADependencyOnTypeRecordsForAbstractTypeDiscriminatorsQuery = {|
  variables: RelayReaderTestDoesNotRecordADependencyOnTypeRecordsForAbstractTypeDiscriminatorsQueryVariables,
  response: RelayReaderTestDoesNotRecordADependencyOnTypeRecordsForAbstractTypeDiscriminatorsQuery$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderTestDoesNotRecordADependencyOnTypeRecordsForAbstractTypeDiscriminatorsQuery",
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
            "name": "RelayReaderTestDoesNotRecordADependencyOnTypeRecordsForAbstractTypeDiscriminatorsFragment"
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
    "name": "RelayReaderTestDoesNotRecordADependencyOnTypeRecordsForAbstractTypeDiscriminatorsQuery",
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
            "kind": "InlineFragment",
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
                    "kind": "InlineFragment",
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "url",
                        "storageKey": null
                      }
                    ],
                    "type": "Entity",
                    "abstractKey": "__isEntity"
                  },
                  (v0/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "type": "Node",
            "abstractKey": "__isNode"
          },
          (v0/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "6709175f32390bc11b7938f0454b073f",
    "id": null,
    "metadata": {},
    "name": "RelayReaderTestDoesNotRecordADependencyOnTypeRecordsForAbstractTypeDiscriminatorsQuery",
    "operationKind": "query",
    "text": "query RelayReaderTestDoesNotRecordADependencyOnTypeRecordsForAbstractTypeDiscriminatorsQuery {\n  me {\n    ...RelayReaderTestDoesNotRecordADependencyOnTypeRecordsForAbstractTypeDiscriminatorsFragment\n    id\n  }\n}\n\nfragment RelayReaderTestDoesNotRecordADependencyOnTypeRecordsForAbstractTypeDiscriminatorsFragment on Node {\n  __isNode: __typename\n  actor {\n    __typename\n    ... on Entity {\n      __isEntity: __typename\n      url\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "c02a2e830cf35883efa58981faeeba66";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderTestDoesNotRecordADependencyOnTypeRecordsForAbstractTypeDiscriminatorsQuery$variables,
  RelayReaderTestDoesNotRecordADependencyOnTypeRecordsForAbstractTypeDiscriminatorsQuery$data,
>*/);
