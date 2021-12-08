/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<31d085cf63e9e14001fdbecf872a7c5f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest28Fragment$fragmentType: FragmentType;
export type RelayMockPayloadGeneratorTest28Fragment$ref = RelayMockPayloadGeneratorTest28Fragment$fragmentType;
export type RelayMockPayloadGeneratorTest28Fragment$data = {|
  +id: string,
  +name: ?string,
  +profile_picture: ?{|
    +uri: ?string,
    +width: ?number,
    +height: ?number,
  |},
  +$fragmentType: RelayMockPayloadGeneratorTest28Fragment$fragmentType,
|};
export type RelayMockPayloadGeneratorTest28Fragment = RelayMockPayloadGeneratorTest28Fragment$data;
export type RelayMockPayloadGeneratorTest28Fragment$key = {
  +$data?: RelayMockPayloadGeneratorTest28Fragment$data,
  +$fragmentSpreads: RelayMockPayloadGeneratorTest28Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayMockPayloadGeneratorTest28Fragment",
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
        },
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
          "name": "height",
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
  (node/*: any*/).hash = "d8def67d724eec4688b6524f536f5946";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayMockPayloadGeneratorTest28Fragment$fragmentType,
  RelayMockPayloadGeneratorTest28Fragment$data,
>*/);
