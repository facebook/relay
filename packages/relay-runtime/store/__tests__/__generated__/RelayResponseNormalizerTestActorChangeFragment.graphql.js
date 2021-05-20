/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<81c30d7d831e11c14fd4a6f8d8b2f5c6>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayResponseNormalizerTestActorChangeFragment$ref: FragmentReference;
declare export opaque type RelayResponseNormalizerTestActorChangeFragment$fragmentType: RelayResponseNormalizerTestActorChangeFragment$ref;
export type RelayResponseNormalizerTestActorChangeFragment = {|
  +name: ?string,
  +$refType: RelayResponseNormalizerTestActorChangeFragment$ref,
|};
export type RelayResponseNormalizerTestActorChangeFragment$data = RelayResponseNormalizerTestActorChangeFragment;
export type RelayResponseNormalizerTestActorChangeFragment$key = {
  +$data?: RelayResponseNormalizerTestActorChangeFragment$data,
  +$fragmentRefs: RelayResponseNormalizerTestActorChangeFragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayResponseNormalizerTestActorChangeFragment",
  "selections": [
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
  (node/*: any*/).hash = "7293585078e62a27bf079936a4b80599";
}

module.exports = node;
