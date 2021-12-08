/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<0eabb0762e0e39ac5426ed8ba720489c>>
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
declare export opaque type useFragmentTestUserFragment$fragmentType: FragmentType;
export type useFragmentTestUserFragment$ref = useFragmentTestUserFragment$fragmentType;
export type useFragmentTestUserFragment$data = {|
  +id: string,
  +name: ?string,
  +$fragmentSpreads: useFragmentTestNestedUserFragment$fragmentType,
  +$fragmentType: useFragmentTestUserFragment$fragmentType,
|};
export type useFragmentTestUserFragment = useFragmentTestUserFragment$data;
export type useFragmentTestUserFragment$key = {
  +$data?: useFragmentTestUserFragment$data,
  +$fragmentSpreads: useFragmentTestUserFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "useFragmentTestUserFragment",
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
  (node/*: any*/).hash = "45f2552f2832b58188e8749182fe8fb6";
}

module.exports = ((node/*: any*/)/*: Fragment<
  useFragmentTestUserFragment$fragmentType,
  useFragmentTestUserFragment$data,
>*/);
