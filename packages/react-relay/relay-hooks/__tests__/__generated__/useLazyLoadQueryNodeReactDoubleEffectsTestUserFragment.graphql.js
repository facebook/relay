/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<ccc2bcbefa5e671510de069bf03b269c>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type useLazyLoadQueryNodeReactDoubleEffectsTestUserFragment$fragmentType: FragmentType;
export type useLazyLoadQueryNodeReactDoubleEffectsTestUserFragment$ref = useLazyLoadQueryNodeReactDoubleEffectsTestUserFragment$fragmentType;
export type useLazyLoadQueryNodeReactDoubleEffectsTestUserFragment$data = {|
  +firstName: ?string,
  +$fragmentType: useLazyLoadQueryNodeReactDoubleEffectsTestUserFragment$fragmentType,
|};
export type useLazyLoadQueryNodeReactDoubleEffectsTestUserFragment = useLazyLoadQueryNodeReactDoubleEffectsTestUserFragment$data;
export type useLazyLoadQueryNodeReactDoubleEffectsTestUserFragment$key = {
  +$data?: useLazyLoadQueryNodeReactDoubleEffectsTestUserFragment$data,
  +$fragmentSpreads: useLazyLoadQueryNodeReactDoubleEffectsTestUserFragment$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  useLazyLoadQueryNodeReactDoubleEffectsTestUserFragment$fragmentType,
  useLazyLoadQueryNodeReactDoubleEffectsTestUserFragment$data,
>*/);
