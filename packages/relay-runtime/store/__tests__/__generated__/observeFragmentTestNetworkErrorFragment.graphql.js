/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<63c81af48f685c620838abbe0a6ff26e>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type observeFragmentTestNetworkErrorFragment$fragmentType: FragmentType;
export type observeFragmentTestNetworkErrorFragment$data = {|
  +me: ?{|
    +name: ?string,
  |},
  +$fragmentType: observeFragmentTestNetworkErrorFragment$fragmentType,
|};
export type observeFragmentTestNetworkErrorFragment$key = {
  +$data?: observeFragmentTestNetworkErrorFragment$data,
  +$fragmentSpreads: observeFragmentTestNetworkErrorFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "observeFragmentTestNetworkErrorFragment",
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
  (node/*: any*/).hash = "08727ee370f3e8859731dc1535a5c718";
}

module.exports = ((node/*: any*/)/*: Fragment<
  observeFragmentTestNetworkErrorFragment$fragmentType,
  observeFragmentTestNetworkErrorFragment$data,
>*/);
