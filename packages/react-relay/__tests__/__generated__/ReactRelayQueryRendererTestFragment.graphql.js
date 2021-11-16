/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<d557dcb11632e8b50a1f194914d0bb9d>>
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
  +$refType: ReactRelayQueryRendererTestFragment$fragmentType,
  +$fragmentType: ReactRelayQueryRendererTestFragment$fragmentType,
|};
export type ReactRelayQueryRendererTestFragment = ReactRelayQueryRendererTestFragment$data;
export type ReactRelayQueryRendererTestFragment$key = {
  +$data?: ReactRelayQueryRendererTestFragment$data,
  +$fragmentRefs: ReactRelayQueryRendererTestFragment$fragmentType,
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
