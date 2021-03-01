/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<0279d5389198d10b2d647f23a0a18205>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayMockEnvironmentWithComponentsTestUsefulAwesomenessFragment$ref: FragmentReference;
declare export opaque type RelayMockEnvironmentWithComponentsTestUsefulAwesomenessFragment$fragmentType: RelayMockEnvironmentWithComponentsTestUsefulAwesomenessFragment$ref;
export type RelayMockEnvironmentWithComponentsTestUsefulAwesomenessFragment = {|
  +id: string,
  +name: ?string,
  +websites: ?$ReadOnlyArray<?string>,
  +$refType: RelayMockEnvironmentWithComponentsTestUsefulAwesomenessFragment$ref,
|};
export type RelayMockEnvironmentWithComponentsTestUsefulAwesomenessFragment$data = RelayMockEnvironmentWithComponentsTestUsefulAwesomenessFragment;
export type RelayMockEnvironmentWithComponentsTestUsefulAwesomenessFragment$key = {
  +$data?: RelayMockEnvironmentWithComponentsTestUsefulAwesomenessFragment$data,
  +$fragmentRefs: RelayMockEnvironmentWithComponentsTestUsefulAwesomenessFragment$ref,
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

module.exports = node;
