/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<3cc10244014f2a675503231c6d45d915>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest16Fragment$ref: FragmentReference;
declare export opaque type RelayMockPayloadGeneratorTest16Fragment$fragmentType: RelayMockPayloadGeneratorTest16Fragment$ref;
export type RelayMockPayloadGeneratorTest16Fragment = $ReadOnlyArray<{|
  +id: string,
  +body: ?{|
    +text: ?string,
  |},
  +$refType: RelayMockPayloadGeneratorTest16Fragment$ref,
|}>;
export type RelayMockPayloadGeneratorTest16Fragment$data = RelayMockPayloadGeneratorTest16Fragment;
export type RelayMockPayloadGeneratorTest16Fragment$key = $ReadOnlyArray<{
  +$data?: RelayMockPayloadGeneratorTest16Fragment$data,
  +$fragmentRefs: RelayMockPayloadGeneratorTest16Fragment$ref,
  ...
}>;
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "RelayMockPayloadGeneratorTest16Fragment",
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
      "concreteType": "Text",
      "kind": "LinkedField",
      "name": "body",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "text",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Comment",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "1c4fafdf5d4418e3477a2522ee42d7ef";
}

module.exports = node;
