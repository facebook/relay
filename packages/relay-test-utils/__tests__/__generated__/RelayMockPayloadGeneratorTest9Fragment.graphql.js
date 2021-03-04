/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<f0685d308dd4982d37819842b5863f9f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest9Fragment$ref: FragmentReference;
declare export opaque type RelayMockPayloadGeneratorTest9Fragment$fragmentType: RelayMockPayloadGeneratorTest9Fragment$ref;
export type RelayMockPayloadGeneratorTest9Fragment = {|
  +actor: ?{|
    +id: string,
    +name: ?string,
  |},
  +$refType: RelayMockPayloadGeneratorTest9Fragment$ref,
|};
export type RelayMockPayloadGeneratorTest9Fragment$data = RelayMockPayloadGeneratorTest9Fragment;
export type RelayMockPayloadGeneratorTest9Fragment$key = {
  +$data?: RelayMockPayloadGeneratorTest9Fragment$data,
  +$fragmentRefs: RelayMockPayloadGeneratorTest9Fragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayMockPayloadGeneratorTest9Fragment",
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
          "name": "id",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "name",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Page",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "44a42bf08c7f46d66efaff297f4e7066";
}

module.exports = node;
