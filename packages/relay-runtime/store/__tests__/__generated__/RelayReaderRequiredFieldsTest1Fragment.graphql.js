/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<49c9e009fde266e7fa639352080958cf>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReaderRequiredFieldsTest1Fragment$fragmentType: FragmentType;
export type RelayReaderRequiredFieldsTest1Fragment$data = ?{
  readonly lastName: string,
  readonly $fragmentType: RelayReaderRequiredFieldsTest1Fragment$fragmentType,
};
export type RelayReaderRequiredFieldsTest1Fragment$key = {
  readonly $data?: RelayReaderRequiredFieldsTest1Fragment$data,
  readonly $fragmentSpreads: RelayReaderRequiredFieldsTest1Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayReaderRequiredFieldsTest1Fragment",
  "selections": [
    {
      "kind": "RequiredField",
      "field": {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "lastName",
        "storageKey": null
      },
      "action": "LOG"
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "5c895b4bf852db5d7ba990fef64eee3f";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayReaderRequiredFieldsTest1Fragment$fragmentType,
  RelayReaderRequiredFieldsTest1Fragment$data,
>*/);
