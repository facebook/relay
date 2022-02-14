/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<14da54f08480a157a2fbea914e697994>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type useLazyLoadQueryNodeTestUserFragment$fragmentType: FragmentType;
export type useLazyLoadQueryNodeTestUserFragment$data = {|
  +name: ?string,
  +$fragmentType: useLazyLoadQueryNodeTestUserFragment$fragmentType,
|};
export type useLazyLoadQueryNodeTestUserFragment$key = {
  +$data?: useLazyLoadQueryNodeTestUserFragment$data,
  +$fragmentSpreads: useLazyLoadQueryNodeTestUserFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "useLazyLoadQueryNodeTestUserFragment",
  "selections": [
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
  (node/*: any*/).hash = "90860ff39f89e2594e3eefcb64f7c8fb";
}

module.exports = ((node/*: any*/)/*: Fragment<
  useLazyLoadQueryNodeTestUserFragment$fragmentType,
  useLazyLoadQueryNodeTestUserFragment$data,
>*/);
