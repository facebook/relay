/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<b7b9c369715fad82f4bcdbd1befa8756>>
 * @flow
 * @lightSyntaxTransform
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
  (node/*:: as any*/).hash = "b9b19a6158a09093e82899345cfaad32";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  ReactRelayRefetchContainerReactDoubleEffectsTestUserFragment$fragmentType,
  ReactRelayRefetchContainerReactDoubleEffectsTestUserFragment$data,
>*/);
