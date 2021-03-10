/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<89a537fe98216c71e239c86d12e0cfc4>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type useLazyLoadQueryNodeReactDoubleEffectsTestUserFragment$ref: FragmentReference;
declare export opaque type useLazyLoadQueryNodeReactDoubleEffectsTestUserFragment$fragmentType: useLazyLoadQueryNodeReactDoubleEffectsTestUserFragment$ref;
export type useLazyLoadQueryNodeReactDoubleEffectsTestUserFragment = {|
  +firstName: ?string,
  +$refType: useLazyLoadQueryNodeReactDoubleEffectsTestUserFragment$ref,
|};
export type useLazyLoadQueryNodeReactDoubleEffectsTestUserFragment$data = useLazyLoadQueryNodeReactDoubleEffectsTestUserFragment;
export type useLazyLoadQueryNodeReactDoubleEffectsTestUserFragment$key = {
  +$data?: useLazyLoadQueryNodeReactDoubleEffectsTestUserFragment$data,
  +$fragmentRefs: useLazyLoadQueryNodeReactDoubleEffectsTestUserFragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "useLazyLoadQueryNodeReactDoubleEffectsTestUserFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "firstName",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "05a65d76979a279f254e16721e9c7471";
}

module.exports = node;
