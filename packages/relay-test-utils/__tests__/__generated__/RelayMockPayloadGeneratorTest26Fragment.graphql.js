/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<45eabaeceb1062e258c3de7532ceea10>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest26Fragment$fragmentType: FragmentType;
export type RelayMockPayloadGeneratorTest26Fragment$data = {
  readonly height: ?number,
  readonly uri: ?string,
  readonly width: ?number,
  readonly $fragmentType: RelayMockPayloadGeneratorTest26Fragment$fragmentType,
};
export type RelayMockPayloadGeneratorTest26Fragment$key = {
  readonly $data?: RelayMockPayloadGeneratorTest26Fragment$data,
  readonly $fragmentSpreads: RelayMockPayloadGeneratorTest26Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayMockPayloadGeneratorTest26Fragment",
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
  "type": "Image",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "52a0092377065d6b742aa9c2a1825484";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayMockPayloadGeneratorTest26Fragment$fragmentType,
  RelayMockPayloadGeneratorTest26Fragment$data,
>*/);
