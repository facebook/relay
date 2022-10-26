/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<b9ba7924ba15dcf313672749564f708c>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type usePaginationFragmentTestNestedUserFragment$fragmentType: FragmentType;
export type usePaginationFragmentTestNestedUserFragment$data = {|
  +username: ?string,
  +$fragmentType: usePaginationFragmentTestNestedUserFragment$fragmentType,
|};
export type usePaginationFragmentTestNestedUserFragment$key = {
  +$data?: usePaginationFragmentTestNestedUserFragment$data,
  +$fragmentSpreads: usePaginationFragmentTestNestedUserFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "usePaginationFragmentTestNestedUserFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "username",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "d9264b58ca5ba023a29d467288406def";
}

module.exports = ((node/*: any*/)/*: Fragment<
  usePaginationFragmentTestNestedUserFragment$fragmentType,
  usePaginationFragmentTestNestedUserFragment$data,
>*/);
