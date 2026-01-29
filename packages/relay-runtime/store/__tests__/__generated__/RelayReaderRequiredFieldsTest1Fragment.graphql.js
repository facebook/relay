/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<9d28de096e514234c001ae0848144f2a>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReaderRequiredFieldsTest1Fragment$fragmentType: FragmentType;
export type RelayReaderRequiredFieldsTest1Fragment$data = ?{|
  +lastName: string,
  +$fragmentType: RelayReaderRequiredFieldsTest1Fragment$fragmentType,
|};
export type RelayReaderRequiredFieldsTest1Fragment$key = {
  +$data?: RelayReaderRequiredFieldsTest1Fragment$data,
  +$fragmentSpreads: RelayReaderRequiredFieldsTest1Fragment$fragmentType,
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
  (node/*: any*/).hash = "5c895b4bf852db5d7ba990fef64eee3f";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayReaderRequiredFieldsTest1Fragment$fragmentType,
  RelayReaderRequiredFieldsTest1Fragment$data,
>*/);
