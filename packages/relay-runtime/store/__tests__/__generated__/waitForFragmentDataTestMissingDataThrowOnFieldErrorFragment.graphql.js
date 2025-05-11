/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<6f9afb2d256bb7fbeebffa25cbe8db7e>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type waitForFragmentDataTestMissingDataThrowOnFieldErrorFragment$fragmentType: FragmentType;
export type waitForFragmentDataTestMissingDataThrowOnFieldErrorFragment$data = {|
  +me: {|
    +name: string | null,
  |} | null,
  +$fragmentType: waitForFragmentDataTestMissingDataThrowOnFieldErrorFragment$fragmentType,
|};
export type waitForFragmentDataTestMissingDataThrowOnFieldErrorFragment$key = {
  +$data?: waitForFragmentDataTestMissingDataThrowOnFieldErrorFragment$data,
  +$fragmentSpreads: waitForFragmentDataTestMissingDataThrowOnFieldErrorFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "throwOnFieldError": true
  },
  "name": "waitForFragmentDataTestMissingDataThrowOnFieldErrorFragment",
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
  (node/*: any*/).hash = "5098c2fa8e0d4f0200a914a51d5cef6c";
}

module.exports = ((node/*: any*/)/*: Fragment<
  waitForFragmentDataTestMissingDataThrowOnFieldErrorFragment$fragmentType,
  waitForFragmentDataTestMissingDataThrowOnFieldErrorFragment$data,
>*/);
