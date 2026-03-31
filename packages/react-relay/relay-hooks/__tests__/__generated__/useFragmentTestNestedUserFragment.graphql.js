/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<20c8611f45da157b692be728261fa7db>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type useFragmentTestNestedUserFragment$fragmentType: FragmentType;
export type useFragmentTestNestedUserFragment$data = {|
  +username: ?string,
  +$fragmentType: useFragmentTestNestedUserFragment$fragmentType,
|};
export type useFragmentTestNestedUserFragment$key = {
  +$data?: useFragmentTestNestedUserFragment$data,
  +$fragmentSpreads: useFragmentTestNestedUserFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "useFragmentTestNestedUserFragment",
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
  (node/*:: as any*/).hash = "4ea048b1d87c7755acab690b182fb089";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  useFragmentTestNestedUserFragment$fragmentType,
  useFragmentTestNestedUserFragment$data,
>*/);
