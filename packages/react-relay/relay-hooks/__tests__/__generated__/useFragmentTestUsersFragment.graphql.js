/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<952d650be004d966f8e20e4219f7f8e2>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { useFragmentTestNestedUserFragment$fragmentType } from "./useFragmentTestNestedUserFragment.graphql";
import type { FragmentType } from "relay-runtime";
declare export opaque type useFragmentTestUsersFragment$fragmentType: FragmentType;
export type useFragmentTestUsersFragment$data = ReadonlyArray<{
  readonly id: string,
  readonly name: ?string,
  readonly $fragmentSpreads: useFragmentTestNestedUserFragment$fragmentType,
  readonly $fragmentType: useFragmentTestUsersFragment$fragmentType,
}>;
export type useFragmentTestUsersFragment$key = ReadonlyArray<{
  readonly $data?: useFragmentTestUsersFragment$data,
  readonly $fragmentSpreads: useFragmentTestUsersFragment$fragmentType,
  ...
}>;
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "useFragmentTestUsersFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "useFragmentTestNestedUserFragment"
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "6772e65e62df942e790dbad17f4fb7f7";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  useFragmentTestUsersFragment$fragmentType,
  useFragmentTestUsersFragment$data,
>*/);
