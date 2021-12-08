/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<a6486687a589821fb658bea7ba48f585>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReaderTestWhenMatchDirectiveIsPresentPlainUserNameRenderer_name$fragmentType: FragmentType;
export type RelayReaderTestWhenMatchDirectiveIsPresentPlainUserNameRenderer_name$ref = RelayReaderTestWhenMatchDirectiveIsPresentPlainUserNameRenderer_name$fragmentType;
export type RelayReaderTestWhenMatchDirectiveIsPresentPlainUserNameRenderer_name$data = {|
  +plaintext: ?string,
  +$fragmentType: RelayReaderTestWhenMatchDirectiveIsPresentPlainUserNameRenderer_name$fragmentType,
|};
export type RelayReaderTestWhenMatchDirectiveIsPresentPlainUserNameRenderer_name = RelayReaderTestWhenMatchDirectiveIsPresentPlainUserNameRenderer_name$data;
export type RelayReaderTestWhenMatchDirectiveIsPresentPlainUserNameRenderer_name$key = {
  +$data?: RelayReaderTestWhenMatchDirectiveIsPresentPlainUserNameRenderer_name$data,
  +$fragmentSpreads: RelayReaderTestWhenMatchDirectiveIsPresentPlainUserNameRenderer_name$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayReaderTestWhenMatchDirectiveIsPresentPlainUserNameRenderer_name",
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
  (node/*: any*/).hash = "b9c5673e4b3f21f63a8efe831dfea528";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayReaderTestWhenMatchDirectiveIsPresentPlainUserNameRenderer_name$fragmentType,
  RelayReaderTestWhenMatchDirectiveIsPresentPlainUserNameRenderer_name$data,
>*/);
