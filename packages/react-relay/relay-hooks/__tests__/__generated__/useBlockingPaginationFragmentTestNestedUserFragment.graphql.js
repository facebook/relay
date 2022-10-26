/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<93ef0e4560cffab14d6452f50f46a50d>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type useBlockingPaginationFragmentTestNestedUserFragment$fragmentType: FragmentType;
export type useBlockingPaginationFragmentTestNestedUserFragment$data = {|
  +username: ?string,
  +$fragmentType: useBlockingPaginationFragmentTestNestedUserFragment$fragmentType,
|};
export type useBlockingPaginationFragmentTestNestedUserFragment$key = {
  +$data?: useBlockingPaginationFragmentTestNestedUserFragment$data,
  +$fragmentSpreads: useBlockingPaginationFragmentTestNestedUserFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "useBlockingPaginationFragmentTestNestedUserFragment",
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
  (node/*: any*/).hash = "eb2765a66613b55829da5ea9c3c0627a";
}

module.exports = ((node/*: any*/)/*: Fragment<
  useBlockingPaginationFragmentTestNestedUserFragment$fragmentType,
  useBlockingPaginationFragmentTestNestedUserFragment$data,
>*/);
