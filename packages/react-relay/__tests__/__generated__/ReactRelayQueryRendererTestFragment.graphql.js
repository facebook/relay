/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<461eae1b6fc02d9e8be717ea48f9c47a>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type ReactRelayQueryRendererTestFragment$fragmentType: FragmentType;
export type ReactRelayQueryRendererTestFragment$ref = ReactRelayQueryRendererTestFragment$fragmentType;
export type ReactRelayQueryRendererTestFragment$data = {|
  +name: ?string,
  +$fragmentType: ReactRelayQueryRendererTestFragment$fragmentType,
|};
export type ReactRelayQueryRendererTestFragment = ReactRelayQueryRendererTestFragment$data;
export type ReactRelayQueryRendererTestFragment$key = {
  +$data?: ReactRelayQueryRendererTestFragment$data,
  +$fragmentSpreads: ReactRelayQueryRendererTestFragment$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  ReactRelayQueryRendererTestFragment$fragmentType,
  ReactRelayQueryRendererTestFragment$data,
>*/);
