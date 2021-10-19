/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<82e54033f8bb23983d08c89926151d93>>
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
declare export opaque type useFragmentTestUserFragment$ref: FragmentReference;
declare export opaque type useFragmentTestUserFragment$fragmentType: useFragmentTestUserFragment$ref;
export type useFragmentTestUserFragment = {|
  +id: string,
  +name: ?string,
  +$fragmentRefs: useFragmentTestNestedUserFragment$ref,
  +$refType: useFragmentTestUserFragment$ref,
|};
export type useFragmentTestUserFragment$data = useFragmentTestUserFragment;
export type useFragmentTestUserFragment$key = {
  +$data?: useFragmentTestUserFragment$data,
  +$fragmentRefs: useFragmentTestUserFragment$ref,
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

module.exports = node;
