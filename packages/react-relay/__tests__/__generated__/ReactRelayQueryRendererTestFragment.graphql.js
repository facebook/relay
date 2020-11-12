/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<7bb7102f6dd553f1780faa2dd0b4a988>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type ReactRelayQueryRendererTestFragment$ref: FragmentReference;
declare export opaque type ReactRelayQueryRendererTestFragment$fragmentType: ReactRelayQueryRendererTestFragment$ref;
export type ReactRelayQueryRendererTestFragment = {|
  +name: ?string,
  +$refType: ReactRelayQueryRendererTestFragment$ref,
|};
export type ReactRelayQueryRendererTestFragment$data = ReactRelayQueryRendererTestFragment;
export type ReactRelayQueryRendererTestFragment$key = {
  +$data?: ReactRelayQueryRendererTestFragment$data,
  +$fragmentRefs: ReactRelayQueryRendererTestFragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ReactRelayQueryRendererTestFragment",
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
  (node/*: any*/).hash = "217440fbdae0f10ec8969707bffc1c61";
}

module.exports = node;
