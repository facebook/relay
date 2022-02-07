/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<34e3596efc2654303c3afb7f61f9af49>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type getFragmentIdentifierTestNestedUserFragment$fragmentType: FragmentType;
export type getFragmentIdentifierTestNestedUserFragment$data = {|
  +username: ?string,
  +$fragmentType: getFragmentIdentifierTestNestedUserFragment$fragmentType,
|};
export type getFragmentIdentifierTestNestedUserFragment$key = {
  +$data?: getFragmentIdentifierTestNestedUserFragment$data,
  +$fragmentSpreads: getFragmentIdentifierTestNestedUserFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "getFragmentIdentifierTestNestedUserFragment",
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
  (node/*: any*/).hash = "75c693cc47597efb281a82456e21fd4d";
}

module.exports = ((node/*: any*/)/*: Fragment<
  getFragmentIdentifierTestNestedUserFragment$fragmentType,
  getFragmentIdentifierTestNestedUserFragment$data,
>*/);
