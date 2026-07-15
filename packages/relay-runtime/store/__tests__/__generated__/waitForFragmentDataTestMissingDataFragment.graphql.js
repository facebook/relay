/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<39c282d3164dea2248bdc988fe2ca81b>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type waitForFragmentDataTestMissingDataFragment$fragmentType: FragmentType;
export type waitForFragmentDataTestMissingDataFragment$data = {
  readonly me: ?{
    readonly name: ?string,
  },
  readonly $fragmentType: waitForFragmentDataTestMissingDataFragment$fragmentType,
};
export type waitForFragmentDataTestMissingDataFragment$key = {
  readonly $data?: waitForFragmentDataTestMissingDataFragment$data,
  readonly $fragmentSpreads: waitForFragmentDataTestMissingDataFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "waitForFragmentDataTestMissingDataFragment",
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
          "name": "name",
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
  (node/*:: as any*/).hash = "0992b9b33ecb5789cfce24486852b9ae";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  waitForFragmentDataTestMissingDataFragment$fragmentType,
  waitForFragmentDataTestMissingDataFragment$data,
>*/);
