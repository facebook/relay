/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<84b3a447886f98b552b8e238b165bafc>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernEnvironmentLookupTestChildFragment$ref: FragmentReference;
declare export opaque type RelayModernEnvironmentLookupTestChildFragment$fragmentType: RelayModernEnvironmentLookupTestChildFragment$ref;
export type RelayModernEnvironmentLookupTestChildFragment = {|
  +id: string,
  +name: ?string,
  +$refType: RelayModernEnvironmentLookupTestChildFragment$ref,
|};
export type RelayModernEnvironmentLookupTestChildFragment$data = RelayModernEnvironmentLookupTestChildFragment;
export type RelayModernEnvironmentLookupTestChildFragment$key = {
  +$data?: RelayModernEnvironmentLookupTestChildFragment$data,
  +$fragmentRefs: RelayModernEnvironmentLookupTestChildFragment$ref,
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

module.exports = node;
