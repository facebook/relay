/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<42909f0ddb082f13e68e2757368fdfe9>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type waitForFragmentDataTestMissingDataThrowOnFieldErrorFragment$fragmentType: FragmentType;
export type waitForFragmentDataTestMissingDataThrowOnFieldErrorFragment$data = {
  readonly me: ?{
    readonly name: ?string,
  },
  readonly $fragmentType: waitForFragmentDataTestMissingDataThrowOnFieldErrorFragment$fragmentType,
};
export type waitForFragmentDataTestMissingDataThrowOnFieldErrorFragment$key = {
  readonly $data?: waitForFragmentDataTestMissingDataThrowOnFieldErrorFragment$data,
  readonly $fragmentSpreads: waitForFragmentDataTestMissingDataThrowOnFieldErrorFragment$fragmentType,
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
  (node/*:: as any*/).hash = "5098c2fa8e0d4f0200a914a51d5cef6c";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  waitForFragmentDataTestMissingDataThrowOnFieldErrorFragment$fragmentType,
  waitForFragmentDataTestMissingDataThrowOnFieldErrorFragment$data,
>*/);
