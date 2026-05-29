/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<6d6d8f4cdf759dc4c7538fcb772aa047>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest29Fragment$fragmentType: FragmentType;
export type RelayMockPayloadGeneratorTest29Fragment$data = {
  readonly id: string,
  readonly pageName: ?string,
  readonly $fragmentType: RelayMockPayloadGeneratorTest29Fragment$fragmentType,
};
export type RelayMockPayloadGeneratorTest29Fragment$key = {
  readonly $data?: RelayMockPayloadGeneratorTest29Fragment$data,
  readonly $fragmentSpreads: RelayMockPayloadGeneratorTest29Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayMockPayloadGeneratorTest29Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "alias": "pageName",
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    }
  ],
  "type": "Page",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "6c2f0ef36ab5cc0d9063e2db9d68492e";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayMockPayloadGeneratorTest29Fragment$fragmentType,
  RelayMockPayloadGeneratorTest29Fragment$data,
>*/);
