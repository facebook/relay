/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<0ddb8f20fecdc8800448be72be726742>>
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
export type useFragmentTestNestedUserFragment$ref = useFragmentTestNestedUserFragment$fragmentType;
export type useFragmentTestNestedUserFragment$data = {|
  +username: ?string,
  +$fragmentType: useFragmentTestNestedUserFragment$fragmentType,
|};
export type useFragmentTestNestedUserFragment = useFragmentTestNestedUserFragment$data;
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
  (node/*: any*/).hash = "4ea048b1d87c7755acab690b182fb089";
}

module.exports = ((node/*: any*/)/*: Fragment<
  useFragmentTestNestedUserFragment$fragmentType,
  useFragmentTestNestedUserFragment$data,
>*/);
