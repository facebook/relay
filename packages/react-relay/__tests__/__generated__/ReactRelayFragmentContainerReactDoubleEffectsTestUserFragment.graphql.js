/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<cb223f844ff750700427564b9e049653>>
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
export type ReactRelayFragmentContainerReactDoubleEffectsTestUserFragment$data = {|
  +id: string,
  +name: ?string,
  +$fragmentType: ReactRelayFragmentContainerReactDoubleEffectsTestUserFragment$fragmentType,
|};
export type ReactRelayFragmentContainerReactDoubleEffectsTestUserFragment$key = {
  +$data?: ReactRelayFragmentContainerReactDoubleEffectsTestUserFragment$data,
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
