/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<ac22265ede1c25ddb5f9c9459e98b3f8>>
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
  +me: ?{|
    +name: ?string,
  |},
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
