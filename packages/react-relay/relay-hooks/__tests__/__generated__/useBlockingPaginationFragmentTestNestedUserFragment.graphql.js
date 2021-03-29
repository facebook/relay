/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<372c87088fadc8bbd6992d2de2255c9e>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type useBlockingPaginationFragmentTestNestedUserFragment$ref: FragmentReference;
declare export opaque type useBlockingPaginationFragmentTestNestedUserFragment$fragmentType: useBlockingPaginationFragmentTestNestedUserFragment$ref;
export type useBlockingPaginationFragmentTestNestedUserFragment = {|
  +username: ?string,
  +$refType: useBlockingPaginationFragmentTestNestedUserFragment$ref,
|};
export type useBlockingPaginationFragmentTestNestedUserFragment$data = useBlockingPaginationFragmentTestNestedUserFragment;
export type useBlockingPaginationFragmentTestNestedUserFragment$key = {
  +$data?: useBlockingPaginationFragmentTestNestedUserFragment$data,
  +$fragmentRefs: useBlockingPaginationFragmentTestNestedUserFragment$ref,
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

module.exports = node;
