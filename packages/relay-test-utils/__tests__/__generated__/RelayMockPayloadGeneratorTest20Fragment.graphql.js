/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<501bd0a3f240f2792d8cd8cdabbd09cd>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { RelayMockPayloadGeneratorTest17Fragment$fragmentType } from "./RelayMockPayloadGeneratorTest17Fragment.graphql";
import type { RelayMockPayloadGeneratorTest18Fragment$fragmentType } from "./RelayMockPayloadGeneratorTest18Fragment.graphql";
import type { RelayMockPayloadGeneratorTest19Fragment$fragmentType } from "./RelayMockPayloadGeneratorTest19Fragment.graphql";
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest20Fragment$fragmentType: FragmentType;
export type RelayMockPayloadGeneratorTest20Fragment$data = {|
  +actor: ?{|
    +id: string,
    +name: ?string,
  |},
  +body: ?{|
    +text: ?string,
  |},
  +myActor: ?{|
    +$fragmentSpreads: RelayMockPayloadGeneratorTest17Fragment$fragmentType,
  |},
  +$fragmentSpreads: RelayMockPayloadGeneratorTest18Fragment$fragmentType & RelayMockPayloadGeneratorTest19Fragment$fragmentType,
  +$fragmentType: RelayMockPayloadGeneratorTest20Fragment$fragmentType,
|};
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
  (node/*: any*/).hash = "2e12e553476613cfd4087dc1f1407096";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayMockPayloadGeneratorTest20Fragment$fragmentType,
  RelayMockPayloadGeneratorTest20Fragment$data,
>*/);
