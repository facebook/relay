/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<f7d7e86abb46e4209d10962a80269ce2>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type ReactRelayRefetchContainerReactDoubleEffectsTestUserFragment$fragmentType: FragmentType;
export type ReactRelayRefetchContainerReactDoubleEffectsTestUserFragment$data = {|
  +id: string,
  +name: ?string,
  +$fragmentType: ReactRelayRefetchContainerReactDoubleEffectsTestUserFragment$fragmentType,
|};
export type ReactRelayRefetchContainerReactDoubleEffectsTestUserFragment$key = {
  +$data?: ReactRelayRefetchContainerReactDoubleEffectsTestUserFragment$data,
  +$fragmentSpreads: ReactRelayRefetchContainerReactDoubleEffectsTestUserFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ReactRelayRefetchContainerReactDoubleEffectsTestUserFragment",
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
  (node/*: any*/).hash = "b9b19a6158a09093e82899345cfaad32";
}

module.exports = ((node/*: any*/)/*: Fragment<
  ReactRelayRefetchContainerReactDoubleEffectsTestUserFragment$fragmentType,
  ReactRelayRefetchContainerReactDoubleEffectsTestUserFragment$data,
>*/);
