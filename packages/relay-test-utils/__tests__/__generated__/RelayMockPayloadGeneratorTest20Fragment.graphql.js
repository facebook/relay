/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<d0073f0531094e700dd0fccfca2c2d31>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
type RelayMockPayloadGeneratorTest17Fragment$fragmentType = any;
type RelayMockPayloadGeneratorTest18Fragment$fragmentType = any;
type RelayMockPayloadGeneratorTest19Fragment$fragmentType = any;
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest20Fragment$fragmentType: FragmentType;
export type RelayMockPayloadGeneratorTest20Fragment$ref = RelayMockPayloadGeneratorTest20Fragment$fragmentType;
export type RelayMockPayloadGeneratorTest20Fragment$data = {|
  +body: ?{|
    +text: ?string,
  |},
  +actor: ?{|
    +name: ?string,
    +id: string,
  |},
  +myActor: ?{|
    +$fragmentSpreads: RelayMockPayloadGeneratorTest17Fragment$fragmentType,
  |},
  +$fragmentSpreads: RelayMockPayloadGeneratorTest18Fragment$fragmentType & RelayMockPayloadGeneratorTest19Fragment$fragmentType,
  +$fragmentType: RelayMockPayloadGeneratorTest20Fragment$fragmentType,
|};
export type RelayMockPayloadGeneratorTest20Fragment = RelayMockPayloadGeneratorTest20Fragment$data;
export type RelayMockPayloadGeneratorTest20Fragment$key = {
  +$data?: RelayMockPayloadGeneratorTest20Fragment$data,
  +$fragmentSpreads: RelayMockPayloadGeneratorTest20Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayMockPayloadGeneratorTest20Fragment",
  "selections": [
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
    },
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
    },
    {
      "alias": "myActor",
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "actor",
      "plural": false,
      "selections": [
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "RelayMockPayloadGeneratorTest17Fragment"
        }
      ],
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "RelayMockPayloadGeneratorTest18Fragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "RelayMockPayloadGeneratorTest19Fragment"
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "d436f500bb695c067652f4f926493f86";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayMockPayloadGeneratorTest20Fragment$fragmentType,
  RelayMockPayloadGeneratorTest20Fragment$data,
>*/);
