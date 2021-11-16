/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<02d4bf50f1bc639d14ea2e92c1ee19c8>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentLookupTestChildFragment$fragmentType: FragmentType;
export type RelayModernEnvironmentLookupTestChildFragment$ref = RelayModernEnvironmentLookupTestChildFragment$fragmentType;
export type RelayModernEnvironmentLookupTestChildFragment$data = {|
  +id: string,
  +name: ?string,
  +$refType: RelayModernEnvironmentLookupTestChildFragment$fragmentType,
  +$fragmentType: RelayModernEnvironmentLookupTestChildFragment$fragmentType,
|};
export type RelayModernEnvironmentLookupTestChildFragment = RelayModernEnvironmentLookupTestChildFragment$data;
export type RelayModernEnvironmentLookupTestChildFragment$key = {
  +$data?: RelayModernEnvironmentLookupTestChildFragment$data,
  +$fragmentRefs: RelayModernEnvironmentLookupTestChildFragment$fragmentType,
  +$fragmentSpreads: RelayModernEnvironmentLookupTestChildFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentLookupTestChildFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
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
  (node/*: any*/).hash = "8cfadb88c2b03631bbdf0c6fee7e4044";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentLookupTestChildFragment$fragmentType,
  RelayModernEnvironmentLookupTestChildFragment$data,
>*/);
