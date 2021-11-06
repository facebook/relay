/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<e96be6b628962b4ff52dbf1ef496eadc>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type ReactRelayRefetchContainerReactDoubleEffectsTestUserFragment$ref: FragmentReference;
declare export opaque type ReactRelayRefetchContainerReactDoubleEffectsTestUserFragment$fragmentType: ReactRelayRefetchContainerReactDoubleEffectsTestUserFragment$ref;
export type ReactRelayRefetchContainerReactDoubleEffectsTestUserFragment = {|
  +id: string,
  +name: ?string,
  +$refType: ReactRelayRefetchContainerReactDoubleEffectsTestUserFragment$ref,
|};
export type ReactRelayRefetchContainerReactDoubleEffectsTestUserFragment$data = ReactRelayRefetchContainerReactDoubleEffectsTestUserFragment;
export type ReactRelayRefetchContainerReactDoubleEffectsTestUserFragment$key = {
  +$data?: ReactRelayRefetchContainerReactDoubleEffectsTestUserFragment$data,
  +$fragmentRefs: ReactRelayRefetchContainerReactDoubleEffectsTestUserFragment$ref,
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

module.exports = node;
