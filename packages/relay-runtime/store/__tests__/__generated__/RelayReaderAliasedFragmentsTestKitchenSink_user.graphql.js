/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<ca3e972d8b497d2306d29b8b8cf7bd43>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReaderAliasedFragmentsTestKitchenSink_user$fragmentType: FragmentType;
export type RelayReaderAliasedFragmentsTestKitchenSink_user$data = {|
  +name: ?string,
  +$fragmentType: RelayReaderAliasedFragmentsTestKitchenSink_user$fragmentType,
|};
export type RelayReaderAliasedFragmentsTestKitchenSink_user$key = {
  +$data?: RelayReaderAliasedFragmentsTestKitchenSink_user$data,
  +$fragmentSpreads: RelayReaderAliasedFragmentsTestKitchenSink_user$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayReaderAliasedFragmentsTestKitchenSink_user",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "b91dfb2ff233ab4e4030158d738f529a";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayReaderAliasedFragmentsTestKitchenSink_user$fragmentType,
  RelayReaderAliasedFragmentsTestKitchenSink_user$data,
>*/);
