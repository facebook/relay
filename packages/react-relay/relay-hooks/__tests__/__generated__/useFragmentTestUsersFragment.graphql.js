/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<34914b7a075c668f9175bb93b9f2f874>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
type useFragmentTestNestedUserFragment$fragmentType = any;
import type { FragmentType } from "relay-runtime";
declare export opaque type useFragmentTestUsersFragment$fragmentType: FragmentType;
export type useFragmentTestUsersFragment$ref = useFragmentTestUsersFragment$fragmentType;
export type useFragmentTestUsersFragment$data = $ReadOnlyArray<{|
  +id: string,
  +name: ?string,
  +$fragmentRefs: useFragmentTestNestedUserFragment$fragmentType,
  +$fragmentSpreads: useFragmentTestNestedUserFragment$fragmentType,
  +$refType: useFragmentTestUsersFragment$fragmentType,
  +$fragmentType: useFragmentTestUsersFragment$fragmentType,
|}>;
export type useFragmentTestUsersFragment = useFragmentTestUsersFragment$data;
export type useFragmentTestUsersFragment$key = $ReadOnlyArray<{
  +$data?: useFragmentTestUsersFragment$data,
  +$fragmentRefs: useFragmentTestUsersFragment$fragmentType,
  +$fragmentSpreads: useFragmentTestUsersFragment$fragmentType,
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
  (node/*: any*/).hash = "6772e65e62df942e790dbad17f4fb7f7";
}

module.exports = ((node/*: any*/)/*: Fragment<
  useFragmentTestUsersFragment$fragmentType,
  useFragmentTestUsersFragment$data,
>*/);
