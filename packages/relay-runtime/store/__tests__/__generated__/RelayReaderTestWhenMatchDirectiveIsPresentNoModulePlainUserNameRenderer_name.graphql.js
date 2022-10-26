/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<c8fb37696b0718344ed1df9640a95830>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReaderTestWhenMatchDirectiveIsPresentNoModulePlainUserNameRenderer_name$fragmentType: FragmentType;
export type RelayReaderTestWhenMatchDirectiveIsPresentNoModulePlainUserNameRenderer_name$data = {|
  +plaintext: ?string,
  +$fragmentType: RelayReaderTestWhenMatchDirectiveIsPresentNoModulePlainUserNameRenderer_name$fragmentType,
|};
export type RelayReaderTestWhenMatchDirectiveIsPresentNoModulePlainUserNameRenderer_name$key = {
  +$data?: RelayReaderTestWhenMatchDirectiveIsPresentNoModulePlainUserNameRenderer_name$data,
  +$fragmentSpreads: RelayReaderTestWhenMatchDirectiveIsPresentNoModulePlainUserNameRenderer_name$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayReaderTestWhenMatchDirectiveIsPresentNoModulePlainUserNameRenderer_name",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "plaintext",
      "storageKey": null
    }
  ],
  "type": "PlainUserNameRenderer",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "697959d3dac695bfeaf9707ba01b0f7e";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayReaderTestWhenMatchDirectiveIsPresentNoModulePlainUserNameRenderer_name$fragmentType,
  RelayReaderTestWhenMatchDirectiveIsPresentNoModulePlainUserNameRenderer_name$data,
>*/);
