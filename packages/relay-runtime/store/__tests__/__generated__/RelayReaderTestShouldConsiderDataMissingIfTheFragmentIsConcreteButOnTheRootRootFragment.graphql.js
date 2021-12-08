/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<9fa4e84ebf66b3d5a9a17ef7afd47513>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReaderTestShouldConsiderDataMissingIfTheFragmentIsConcreteButOnTheRootRootFragment$fragmentType: FragmentType;
export type RelayReaderTestShouldConsiderDataMissingIfTheFragmentIsConcreteButOnTheRootRootFragment$ref = RelayReaderTestShouldConsiderDataMissingIfTheFragmentIsConcreteButOnTheRootRootFragment$fragmentType;
export type RelayReaderTestShouldConsiderDataMissingIfTheFragmentIsConcreteButOnTheRootRootFragment$data = {|
  +me: ?{|
    +name: ?string,
  |},
  +$fragmentType: RelayReaderTestShouldConsiderDataMissingIfTheFragmentIsConcreteButOnTheRootRootFragment$fragmentType,
|};
export type RelayReaderTestShouldConsiderDataMissingIfTheFragmentIsConcreteButOnTheRootRootFragment = RelayReaderTestShouldConsiderDataMissingIfTheFragmentIsConcreteButOnTheRootRootFragment$data;
export type RelayReaderTestShouldConsiderDataMissingIfTheFragmentIsConcreteButOnTheRootRootFragment$key = {
  +$data?: RelayReaderTestShouldConsiderDataMissingIfTheFragmentIsConcreteButOnTheRootRootFragment$data,
  +$fragmentSpreads: RelayReaderTestShouldConsiderDataMissingIfTheFragmentIsConcreteButOnTheRootRootFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayReaderTestShouldConsiderDataMissingIfTheFragmentIsConcreteButOnTheRootRootFragment",
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
  (node/*: any*/).hash = "aae555f04a7dcfc9206fda9ea299f6af";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayReaderTestShouldConsiderDataMissingIfTheFragmentIsConcreteButOnTheRootRootFragment$fragmentType,
  RelayReaderTestShouldConsiderDataMissingIfTheFragmentIsConcreteButOnTheRootRootFragment$data,
>*/);
