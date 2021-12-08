/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<854497e4e7819aa6d918c5d8900f7911>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest7Fragment$fragmentType: FragmentType;
export type RelayMockPayloadGeneratorTest7Fragment$ref = RelayMockPayloadGeneratorTest7Fragment$fragmentType;
export type RelayMockPayloadGeneratorTest7Fragment$data = {|
  +id: string,
  +name: ?string,
  +profile_picture: ?{|
    +uri: ?string,
  |},
  +$fragmentType: RelayMockPayloadGeneratorTest7Fragment$fragmentType,
|};
export type RelayMockPayloadGeneratorTest7Fragment = RelayMockPayloadGeneratorTest7Fragment$data;
export type RelayMockPayloadGeneratorTest7Fragment$key = {
  +$data?: RelayMockPayloadGeneratorTest7Fragment$data,
  +$fragmentSpreads: RelayMockPayloadGeneratorTest7Fragment$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  RelayMockPayloadGeneratorTest7Fragment$fragmentType,
  RelayMockPayloadGeneratorTest7Fragment$data,
>*/);
