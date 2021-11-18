/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<77817bf09a2f12f8ac919217f510581e>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest8Fragment$fragmentType: FragmentType;
export type RelayMockPayloadGeneratorTest8Fragment$ref = RelayMockPayloadGeneratorTest8Fragment$fragmentType;
export type RelayMockPayloadGeneratorTest8Fragment$data = {|
  +actor: ?{|
    +id: string,
    +name: ?string,
  |},
  +backgroundImage: ?{|
    +width: ?number,
    +uri: ?string,
  |},
  +$fragmentType: RelayMockPayloadGeneratorTest8Fragment$fragmentType,
|};
export type RelayMockPayloadGeneratorTest8Fragment = RelayMockPayloadGeneratorTest8Fragment$data;
export type RelayMockPayloadGeneratorTest8Fragment$key = {
  +$data?: RelayMockPayloadGeneratorTest8Fragment$data,
  +$fragmentSpreads: RelayMockPayloadGeneratorTest8Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayMockPayloadGeneratorTest8Fragment",
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
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Image",
      "kind": "LinkedField",
      "name": "backgroundImage",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "width",
          "storageKey": null
        },
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
  "type": "Page",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "24245e41029753fad23b19317a3a22d9";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayMockPayloadGeneratorTest8Fragment$fragmentType,
  RelayMockPayloadGeneratorTest8Fragment$data,
>*/);
