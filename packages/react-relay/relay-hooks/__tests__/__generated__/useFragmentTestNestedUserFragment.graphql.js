/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<9a7d1a9910d88286328560f5883f7274>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type useFragmentTestNestedUserFragment$ref: FragmentReference;
declare export opaque type useFragmentTestNestedUserFragment$fragmentType: useFragmentTestNestedUserFragment$ref;
export type useFragmentTestNestedUserFragment = {|
  +username: ?string,
  +$refType: useFragmentTestNestedUserFragment$ref,
|};
export type useFragmentTestNestedUserFragment$data = useFragmentTestNestedUserFragment;
export type useFragmentTestNestedUserFragment$key = {
  +$data?: useFragmentTestNestedUserFragment$data,
  +$fragmentRefs: useFragmentTestNestedUserFragment$ref,
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

module.exports = node;
