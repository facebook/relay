/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<3b5b58ffe9fcae7659805ff3e2ca740f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReaderTestDoesNotRecordADependencyOnTypeRecordsForAbstractTypeDiscriminatorsFragment$fragmentType: FragmentType;
export type RelayReaderTestDoesNotRecordADependencyOnTypeRecordsForAbstractTypeDiscriminatorsFragment$ref = RelayReaderTestDoesNotRecordADependencyOnTypeRecordsForAbstractTypeDiscriminatorsFragment$fragmentType;
export type RelayReaderTestDoesNotRecordADependencyOnTypeRecordsForAbstractTypeDiscriminatorsFragment$data = {|
  +actor: ?{|
    +url?: ?string,
  |},
  +$fragmentType: RelayReaderTestDoesNotRecordADependencyOnTypeRecordsForAbstractTypeDiscriminatorsFragment$fragmentType,
|};
export type RelayReaderTestDoesNotRecordADependencyOnTypeRecordsForAbstractTypeDiscriminatorsFragment = RelayReaderTestDoesNotRecordADependencyOnTypeRecordsForAbstractTypeDiscriminatorsFragment$data;
export type RelayReaderTestDoesNotRecordADependencyOnTypeRecordsForAbstractTypeDiscriminatorsFragment$key = {
  +$data?: RelayReaderTestDoesNotRecordADependencyOnTypeRecordsForAbstractTypeDiscriminatorsFragment$data,
  +$fragmentSpreads: RelayReaderTestDoesNotRecordADependencyOnTypeRecordsForAbstractTypeDiscriminatorsFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayReaderTestDoesNotRecordADependencyOnTypeRecordsForAbstractTypeDiscriminatorsFragment",
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
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Node",
  "abstractKey": "__isNode"
};

if (__DEV__) {
  (node/*: any*/).hash = "627a1b6877f224270aac837a0d920d1e";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayReaderTestDoesNotRecordADependencyOnTypeRecordsForAbstractTypeDiscriminatorsFragment$fragmentType,
  RelayReaderTestDoesNotRecordADependencyOnTypeRecordsForAbstractTypeDiscriminatorsFragment$data,
>*/);
