/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<4f8063329bac2409ded61aba64989865>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type ReactRelayFragmentContainerReactDoubleEffectsTestUserFragment$ref: FragmentReference;
declare export opaque type ReactRelayFragmentContainerReactDoubleEffectsTestUserFragment$fragmentType: ReactRelayFragmentContainerReactDoubleEffectsTestUserFragment$ref;
export type ReactRelayFragmentContainerReactDoubleEffectsTestUserFragment = {|
  +id: string,
  +name: ?string,
  +$refType: ReactRelayFragmentContainerReactDoubleEffectsTestUserFragment$ref,
|};
export type ReactRelayFragmentContainerReactDoubleEffectsTestUserFragment$data = ReactRelayFragmentContainerReactDoubleEffectsTestUserFragment;
export type ReactRelayFragmentContainerReactDoubleEffectsTestUserFragment$key = {
  +$data?: ReactRelayFragmentContainerReactDoubleEffectsTestUserFragment$data,
  +$fragmentRefs: ReactRelayFragmentContainerReactDoubleEffectsTestUserFragment$ref,
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

module.exports = node;
