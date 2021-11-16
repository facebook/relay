/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<a4401893b7055dee2238b6d7b7d8d175>>
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
export type ReactRelayRefetchContainerReactDoubleEffectsTestUserFragment$ref = ReactRelayRefetchContainerReactDoubleEffectsTestUserFragment$fragmentType;
export type ReactRelayRefetchContainerReactDoubleEffectsTestUserFragment$data = {|
  +id: string,
  +name: ?string,
  +$refType: ReactRelayRefetchContainerReactDoubleEffectsTestUserFragment$fragmentType,
  +$fragmentType: ReactRelayRefetchContainerReactDoubleEffectsTestUserFragment$fragmentType,
|};
export type ReactRelayRefetchContainerReactDoubleEffectsTestUserFragment = ReactRelayRefetchContainerReactDoubleEffectsTestUserFragment$data;
export type ReactRelayRefetchContainerReactDoubleEffectsTestUserFragment$key = {
  +$data?: ReactRelayRefetchContainerReactDoubleEffectsTestUserFragment$data,
  +$fragmentRefs: ReactRelayRefetchContainerReactDoubleEffectsTestUserFragment$fragmentType,
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
