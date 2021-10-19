/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<9bc02bdb823f5df2b06d82a19a1ce88b>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
type useFragmentTestNestedUserFragment$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type useFragmentTestUsersFragment$ref: FragmentReference;
declare export opaque type useFragmentTestUsersFragment$fragmentType: useFragmentTestUsersFragment$ref;
export type useFragmentTestUsersFragment = $ReadOnlyArray<{|
  +id: string,
  +name: ?string,
  +$fragmentRefs: useFragmentTestNestedUserFragment$ref,
  +$refType: useFragmentTestUsersFragment$ref,
|}>;
export type useFragmentTestUsersFragment$data = useFragmentTestUsersFragment;
export type useFragmentTestUsersFragment$key = $ReadOnlyArray<{
  +$data?: useFragmentTestUsersFragment$data,
  +$fragmentRefs: useFragmentTestUsersFragment$ref,
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

module.exports = node;
