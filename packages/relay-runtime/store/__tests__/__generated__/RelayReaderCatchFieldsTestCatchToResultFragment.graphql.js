/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<6e7971854ba4459296d601d3127a43d6>>
 * @flow
 * @lightSyntaxTransform
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
  (node/*:: as any*/).hash = "c406541b28b1130c58b7f418fafd8a9d";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayReaderCatchFieldsTestCatchToResultFragment$fragmentType,
  RelayReaderCatchFieldsTestCatchToResultFragment$data,
>*/);
