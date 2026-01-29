/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<6c2c417ec9d8c99fc33cbc2a2c54cc9e>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReaderCatchFieldsTestCatchToNullFragment$fragmentType: FragmentType;
export type RelayReaderCatchFieldsTestCatchToNullFragment$data = ?{|
  +me: ?{|
    +firstName: ?string,
  |},
  +$fragmentType: RelayReaderCatchFieldsTestCatchToNullFragment$fragmentType,
|};
export type RelayReaderCatchFieldsTestCatchToNullFragment$key = {
  +$data?: RelayReaderCatchFieldsTestCatchToNullFragment$data,
  +$fragmentSpreads: RelayReaderCatchFieldsTestCatchToNullFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "catchTo": "NULL"
  },
  "name": "RelayReaderCatchFieldsTestCatchToNullFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "User",
      "kind": "LinkedField",
      "name": "me",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "firstName",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Query",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "3223b5876c5dc44ab7b1ba8bc909f8d6";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayReaderCatchFieldsTestCatchToNullFragment$fragmentType,
  RelayReaderCatchFieldsTestCatchToNullFragment$data,
>*/);
