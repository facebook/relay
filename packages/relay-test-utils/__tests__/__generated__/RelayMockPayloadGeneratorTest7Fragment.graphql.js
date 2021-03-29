/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<ab140ae223bd040178019a4712d142ab>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest7Fragment$ref: FragmentReference;
declare export opaque type RelayMockPayloadGeneratorTest7Fragment$fragmentType: RelayMockPayloadGeneratorTest7Fragment$ref;
export type RelayMockPayloadGeneratorTest7Fragment = {|
  +id: string,
  +name: ?string,
  +profile_picture: ?{|
    +uri: ?string,
  |},
  +$refType: RelayMockPayloadGeneratorTest7Fragment$ref,
|};
export type RelayMockPayloadGeneratorTest7Fragment$data = RelayMockPayloadGeneratorTest7Fragment;
export type RelayMockPayloadGeneratorTest7Fragment$key = {
  +$data?: RelayMockPayloadGeneratorTest7Fragment$data,
  +$fragmentRefs: RelayMockPayloadGeneratorTest7Fragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayMockPayloadGeneratorTest7Fragment",
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
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Image",
      "kind": "LinkedField",
      "name": "profile_picture",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "uri",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "4eb7e1a26f75e9e325301ff319ddf425";
}

module.exports = node;
