/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<1fa4bebad4f9d5ab009cd65d212dd706>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { RelayMockPayloadGeneratorTest24Fragment$fragmentType } from "./RelayMockPayloadGeneratorTest24Fragment.graphql";
import type { RelayMockPayloadGeneratorTest25Fragment$fragmentType } from "./RelayMockPayloadGeneratorTest25Fragment.graphql";
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest27Fragment$fragmentType: FragmentType;
export type RelayMockPayloadGeneratorTest27Fragment$data = {|
  +actor: ?{|
    +id: string,
    +name: ?string,
  |},
  +body: ?{|
    +text: ?string,
  |},
  +myActor: ?{|
    +$fragmentSpreads: RelayMockPayloadGeneratorTest24Fragment$fragmentType,
  |},
  +$fragmentSpreads: RelayMockPayloadGeneratorTest25Fragment$fragmentType,
  +$fragmentType: RelayMockPayloadGeneratorTest27Fragment$fragmentType,
|};
export type RelayMockPayloadGeneratorTest27Fragment$key = {
  +$data?: RelayMockPayloadGeneratorTest27Fragment$data,
  +$fragmentSpreads: RelayMockPayloadGeneratorTest27Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayMockPayloadGeneratorTest27Fragment",
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
          "name": "RelayMockPayloadGeneratorTest24Fragment"
        }
      ],
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "RelayMockPayloadGeneratorTest25Fragment"
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "f516f909f2ceff438767128d376606f5";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayMockPayloadGeneratorTest27Fragment$fragmentType,
  RelayMockPayloadGeneratorTest27Fragment$data,
>*/);
