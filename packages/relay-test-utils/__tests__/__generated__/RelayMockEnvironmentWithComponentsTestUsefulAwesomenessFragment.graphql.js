/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<f96ef1fe3c22722130c53b9a93989857>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayMockEnvironmentWithComponentsTestUsefulAwesomenessFragment$fragmentType: FragmentType;
export type RelayMockEnvironmentWithComponentsTestUsefulAwesomenessFragment$data = {|
  +id: string,
  +name: ?string,
  +websites: ?$ReadOnlyArray<?string>,
  +$fragmentType: RelayMockEnvironmentWithComponentsTestUsefulAwesomenessFragment$fragmentType,
|};
export type RelayMockEnvironmentWithComponentsTestUsefulAwesomenessFragment$key = {
  +$data?: RelayMockEnvironmentWithComponentsTestUsefulAwesomenessFragment$data,
  +$fragmentSpreads: RelayMockEnvironmentWithComponentsTestUsefulAwesomenessFragment$fragmentType,
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
  (node/*: any*/).hash = "432b0a19d5c7d27b270eff399b9bea47";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayMockEnvironmentWithComponentsTestUsefulAwesomenessFragment$fragmentType,
  RelayMockEnvironmentWithComponentsTestUsefulAwesomenessFragment$data,
>*/);
