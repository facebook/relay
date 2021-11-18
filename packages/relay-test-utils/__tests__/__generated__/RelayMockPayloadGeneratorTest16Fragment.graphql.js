/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<e05e695af9eaea5c31305b32237e4d70>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest16Fragment$fragmentType: FragmentType;
export type RelayMockPayloadGeneratorTest16Fragment$ref = RelayMockPayloadGeneratorTest16Fragment$fragmentType;
export type RelayMockPayloadGeneratorTest16Fragment$data = $ReadOnlyArray<{|
  +id: string,
  +body: ?{|
    +text: ?string,
  |},
  +$fragmentType: RelayMockPayloadGeneratorTest16Fragment$fragmentType,
|}>;
export type RelayMockPayloadGeneratorTest16Fragment = RelayMockPayloadGeneratorTest16Fragment$data;
export type RelayMockPayloadGeneratorTest16Fragment$key = $ReadOnlyArray<{
  +$data?: RelayMockPayloadGeneratorTest16Fragment$data,
  +$fragmentSpreads: RelayMockPayloadGeneratorTest16Fragment$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  RelayMockPayloadGeneratorTest16Fragment$fragmentType,
  RelayMockPayloadGeneratorTest16Fragment$data,
>*/);
