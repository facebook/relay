/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<1734d51c04fd09cd792589bb2f074fe0>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType, Result } from "relay-runtime";
declare export opaque type RelayReaderCatchFieldsTestCatchToResultFragment$fragmentType: FragmentType;
export type RelayReaderCatchFieldsTestCatchToResultFragment$data = Result<{|
  +me: ?{|
    +firstName: ?string,
  |},
  +$fragmentType: RelayReaderCatchFieldsTestCatchToResultFragment$fragmentType,
|}, unknown>;
export type RelayReaderCatchFieldsTestCatchToResultFragment$key = {
  +$data?: RelayReaderCatchFieldsTestCatchToResultFragment$data,
  +$fragmentSpreads: RelayReaderCatchFieldsTestCatchToResultFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "catchTo": "RESULT"
  },
  "name": "RelayReaderCatchFieldsTestCatchToResultFragment",
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
  (node/*: any*/).hash = "c406541b28b1130c58b7f418fafd8a9d";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayReaderCatchFieldsTestCatchToResultFragment$fragmentType,
  RelayReaderCatchFieldsTestCatchToResultFragment$data,
>*/);
