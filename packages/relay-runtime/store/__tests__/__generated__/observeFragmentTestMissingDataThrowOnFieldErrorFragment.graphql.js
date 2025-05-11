/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<b42ca3f98f8a7030a06d0b38dbe675d4>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type observeFragmentTestMissingDataThrowOnFieldErrorFragment$fragmentType: FragmentType;
export type observeFragmentTestMissingDataThrowOnFieldErrorFragment$data = {|
  +me: {|
    +name: string | null,
  |} | null,
  +$fragmentType: observeFragmentTestMissingDataThrowOnFieldErrorFragment$fragmentType,
|};
export type observeFragmentTestMissingDataThrowOnFieldErrorFragment$key = {
  +$data?: observeFragmentTestMissingDataThrowOnFieldErrorFragment$data,
  +$fragmentSpreads: observeFragmentTestMissingDataThrowOnFieldErrorFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "throwOnFieldError": true
  },
  "name": "observeFragmentTestMissingDataThrowOnFieldErrorFragment",
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
  (node/*: any*/).hash = "2ed2f1567245756999c7243dcf82221c";
}

module.exports = ((node/*: any*/)/*: Fragment<
  observeFragmentTestMissingDataThrowOnFieldErrorFragment$fragmentType,
  observeFragmentTestMissingDataThrowOnFieldErrorFragment$data,
>*/);
