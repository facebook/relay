/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<a5f9769ed5a4410eb83b95e520150ee4>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type usePreloadedQueryReactDoubleEffectsTestFragment$ref: FragmentReference;
declare export opaque type usePreloadedQueryReactDoubleEffectsTestFragment$fragmentType: usePreloadedQueryReactDoubleEffectsTestFragment$ref;
export type usePreloadedQueryReactDoubleEffectsTestFragment = {|
  +firstName: ?string,
  +$refType: usePreloadedQueryReactDoubleEffectsTestFragment$ref,
|};
export type usePreloadedQueryReactDoubleEffectsTestFragment$data = usePreloadedQueryReactDoubleEffectsTestFragment;
export type usePreloadedQueryReactDoubleEffectsTestFragment$key = {
  +$data?: usePreloadedQueryReactDoubleEffectsTestFragment$data,
  +$fragmentRefs: usePreloadedQueryReactDoubleEffectsTestFragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "usePreloadedQueryReactDoubleEffectsTestFragment",
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
  (node/*: any*/).hash = "a43d250232fe13605245eff128073c51";
}

module.exports = node;
