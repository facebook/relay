/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<f4947364619e55c64f3b72ac9699a6b5>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type ReactRelayFragmentContainerReactDoubleEffectsTestUserFragment$fragmentType: FragmentType;
export type ReactRelayFragmentContainerReactDoubleEffectsTestUserFragment$ref = ReactRelayFragmentContainerReactDoubleEffectsTestUserFragment$fragmentType;
export type ReactRelayFragmentContainerReactDoubleEffectsTestUserFragment$data = {|
  +id: string,
  +name: ?string,
  +$refType: ReactRelayFragmentContainerReactDoubleEffectsTestUserFragment$fragmentType,
  +$fragmentType: ReactRelayFragmentContainerReactDoubleEffectsTestUserFragment$fragmentType,
|};
export type ReactRelayFragmentContainerReactDoubleEffectsTestUserFragment = ReactRelayFragmentContainerReactDoubleEffectsTestUserFragment$data;
export type ReactRelayFragmentContainerReactDoubleEffectsTestUserFragment$key = {
  +$data?: ReactRelayFragmentContainerReactDoubleEffectsTestUserFragment$data,
  +$fragmentRefs: ReactRelayFragmentContainerReactDoubleEffectsTestUserFragment$fragmentType,
  +$fragmentSpreads: ReactRelayFragmentContainerReactDoubleEffectsTestUserFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ReactRelayFragmentContainerReactDoubleEffectsTestUserFragment",
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
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "dbd352edf4ae89adc3684c717f26a3d7";
}

module.exports = ((node/*: any*/)/*: Fragment<
  ReactRelayFragmentContainerReactDoubleEffectsTestUserFragment$fragmentType,
  ReactRelayFragmentContainerReactDoubleEffectsTestUserFragment$data,
>*/);
