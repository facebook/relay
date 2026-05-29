/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<66a5b549a5c4e1b62ef1ba1bc5ad6131>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest28Fragment$fragmentType: FragmentType;
export type RelayMockPayloadGeneratorTest28Fragment$data = {
  readonly id: string,
  readonly name: ?string,
  readonly profile_picture: ?{
    readonly height: ?number,
    readonly uri: ?string,
    readonly width: ?number,
  },
  readonly $fragmentType: RelayMockPayloadGeneratorTest28Fragment$fragmentType,
};
export type RelayMockPayloadGeneratorTest28Fragment$key = {
  readonly $data?: RelayMockPayloadGeneratorTest28Fragment$data,
  readonly $fragmentSpreads: RelayMockPayloadGeneratorTest28Fragment$fragmentType,
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
  (node/*:: as any*/).hash = "d8def67d724eec4688b6524f536f5946";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayMockPayloadGeneratorTest28Fragment$fragmentType,
  RelayMockPayloadGeneratorTest28Fragment$data,
>*/);
