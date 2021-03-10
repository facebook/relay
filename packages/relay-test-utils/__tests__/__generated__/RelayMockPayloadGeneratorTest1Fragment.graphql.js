/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<23b965b8e7d9fe9893407855b50dfe5b>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest1Fragment$ref: FragmentReference;
declare export opaque type RelayMockPayloadGeneratorTest1Fragment$fragmentType: RelayMockPayloadGeneratorTest1Fragment$ref;
export type RelayMockPayloadGeneratorTest1Fragment = {|
  +id: string,
  +name?: ?string,
  +firstName?: ?string,
  +lastName?: ?string,
  +websites?: ?$ReadOnlyArray<?string>,
  +$refType: RelayMockPayloadGeneratorTest1Fragment$ref,
|};
export type RelayMockPayloadGeneratorTest1Fragment$data = RelayMockPayloadGeneratorTest1Fragment;
export type RelayMockPayloadGeneratorTest1Fragment$key = {
  +$data?: RelayMockPayloadGeneratorTest1Fragment$data,
  +$fragmentRefs: RelayMockPayloadGeneratorTest1Fragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayMockPayloadGeneratorTest1Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "name",
          "storageKey": null
        }
      ],
      "type": "Named",
      "abstractKey": "__isNamed"
    },
    {
      "kind": "InlineFragment",
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "firstName",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "lastName",
          "storageKey": null
        }
      ],
      "type": "User",
      "abstractKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "websites",
          "storageKey": null
        }
      ],
      "type": "Page",
      "abstractKey": null
    }
  ],
  "type": "Actor",
  "abstractKey": "__isActor"
};

if (__DEV__) {
  (node/*: any*/).hash = "655e53b1e06b621fffd25ad651fdad29";
}

module.exports = node;
