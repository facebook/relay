/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<af6b4d8dac87eb9467573bb61d5c2d87>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
type RelayMockPayloadGeneratorTest24Fragment$fragmentType = any;
type RelayMockPayloadGeneratorTest25Fragment$fragmentType = any;
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
  (node/*: any*/).hash = "07719ddfc2591587bf8141cba4f35d9f";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayMockPayloadGeneratorTest27Fragment$fragmentType,
  RelayMockPayloadGeneratorTest27Fragment$data,
>*/);
