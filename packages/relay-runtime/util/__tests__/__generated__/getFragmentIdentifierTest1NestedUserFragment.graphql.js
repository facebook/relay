/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<48ccd1d26bfa0f76fe50c95659a875ac>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type getFragmentIdentifierTest1NestedUserFragment$fragmentType: FragmentType;
export type getFragmentIdentifierTest1NestedUserFragment$data = {
  readonly username: ?string,
  readonly $fragmentType: getFragmentIdentifierTest1NestedUserFragment$fragmentType,
};
export type getFragmentIdentifierTest1NestedUserFragment$key = {
  readonly $data?: getFragmentIdentifierTest1NestedUserFragment$data,
  readonly $fragmentSpreads: getFragmentIdentifierTest1NestedUserFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "getFragmentIdentifierTest1NestedUserFragment",
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
  (node/*:: as any*/).hash = "416e0c5b76d8b86295b2ba956b602ea7";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  getFragmentIdentifierTest1NestedUserFragment$fragmentType,
  getFragmentIdentifierTest1NestedUserFragment$data,
>*/);
