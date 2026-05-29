/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<441a3c5c6758a9f4973d1f49b37cb87a>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type getFragmentIdentifierTestNestedUserFragment$fragmentType: FragmentType;
export type getFragmentIdentifierTestNestedUserFragment$data = {
  readonly username: ?string,
  readonly $fragmentType: getFragmentIdentifierTestNestedUserFragment$fragmentType,
};
export type getFragmentIdentifierTestNestedUserFragment$key = {
  readonly $data?: getFragmentIdentifierTestNestedUserFragment$data,
  readonly $fragmentSpreads: getFragmentIdentifierTestNestedUserFragment$fragmentType,
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
  (node/*:: as any*/).hash = "75c693cc47597efb281a82456e21fd4d";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  getFragmentIdentifierTestNestedUserFragment$fragmentType,
  getFragmentIdentifierTestNestedUserFragment$data,
>*/);
