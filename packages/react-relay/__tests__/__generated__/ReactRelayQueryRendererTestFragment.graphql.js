/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<a3ba27f3e901b248e947eceef48cb579>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type ReactRelayQueryRendererTestFragment$fragmentType: FragmentType;
export type ReactRelayQueryRendererTestFragment$data = {
  readonly name: ?string,
  readonly $fragmentType: ReactRelayQueryRendererTestFragment$fragmentType,
};
export type ReactRelayQueryRendererTestFragment$key = {
  readonly $data?: ReactRelayQueryRendererTestFragment$data,
  readonly $fragmentSpreads: ReactRelayQueryRendererTestFragment$fragmentType,
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
  (node/*:: as any*/).hash = "217440fbdae0f10ec8969707bffc1c61";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  ReactRelayQueryRendererTestFragment$fragmentType,
  ReactRelayQueryRendererTestFragment$data,
>*/);
