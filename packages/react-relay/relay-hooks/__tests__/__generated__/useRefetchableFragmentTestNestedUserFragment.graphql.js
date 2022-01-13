/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<c742124c99986e6e198aefe1ac99deab>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type useRefetchableFragmentTestNestedUserFragment$fragmentType: FragmentType;
export type useRefetchableFragmentTestNestedUserFragment$ref = useRefetchableFragmentTestNestedUserFragment$fragmentType;
export type useRefetchableFragmentTestNestedUserFragment$data = {|
  +username: ?string,
  +$fragmentType: useRefetchableFragmentTestNestedUserFragment$fragmentType,
|};
export type useRefetchableFragmentTestNestedUserFragment = useRefetchableFragmentTestNestedUserFragment$data;
export type useRefetchableFragmentTestNestedUserFragment$key = {
  +$data?: useRefetchableFragmentTestNestedUserFragment$data,
  +$fragmentSpreads: useRefetchableFragmentTestNestedUserFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "useRefetchableFragmentTestNestedUserFragment",
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
  (node/*: any*/).hash = "21d3d4e938aaac9fad56a163df5f1914";
}

module.exports = ((node/*: any*/)/*: Fragment<
  useRefetchableFragmentTestNestedUserFragment$fragmentType,
  useRefetchableFragmentTestNestedUserFragment$data,
>*/);
