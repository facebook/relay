/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<1852c9da0a30558b8c38a8e630245072>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayMockEnvironmentWithComponentsTestUsefulAwesomenessFragment$fragmentType: FragmentType;
export type RelayMockEnvironmentWithComponentsTestUsefulAwesomenessFragment$data = {
  readonly id: string,
  readonly name: ?string,
  readonly websites: ?ReadonlyArray<?string>,
  readonly $fragmentType: RelayMockEnvironmentWithComponentsTestUsefulAwesomenessFragment$fragmentType,
};
export type RelayMockEnvironmentWithComponentsTestUsefulAwesomenessFragment$key = {
  readonly $data?: RelayMockEnvironmentWithComponentsTestUsefulAwesomenessFragment$data,
  readonly $fragmentSpreads: RelayMockEnvironmentWithComponentsTestUsefulAwesomenessFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayMockEnvironmentWithComponentsTestUsefulAwesomenessFragment",
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
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "websites",
      "storageKey": null
    }
  ],
  "type": "Page",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "432b0a19d5c7d27b270eff399b9bea47";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayMockEnvironmentWithComponentsTestUsefulAwesomenessFragment$fragmentType,
  RelayMockEnvironmentWithComponentsTestUsefulAwesomenessFragment$data,
>*/);
