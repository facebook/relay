/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<8fa3624ad7b8ad85922d7ceac81e6745>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayReaderTestWhenMatchDirectiveIsPresentPlainUserNameRenderer_name$ref: FragmentReference;
declare export opaque type RelayReaderTestWhenMatchDirectiveIsPresentPlainUserNameRenderer_name$fragmentType: RelayReaderTestWhenMatchDirectiveIsPresentPlainUserNameRenderer_name$ref;
export type RelayReaderTestWhenMatchDirectiveIsPresentPlainUserNameRenderer_name = {|
  +plaintext: ?string,
  +$refType: RelayReaderTestWhenMatchDirectiveIsPresentPlainUserNameRenderer_name$ref,
|};
export type RelayReaderTestWhenMatchDirectiveIsPresentPlainUserNameRenderer_name$data = RelayReaderTestWhenMatchDirectiveIsPresentPlainUserNameRenderer_name;
export type RelayReaderTestWhenMatchDirectiveIsPresentPlainUserNameRenderer_name$key = {
  +$data?: RelayReaderTestWhenMatchDirectiveIsPresentPlainUserNameRenderer_name$data,
  +$fragmentRefs: RelayReaderTestWhenMatchDirectiveIsPresentPlainUserNameRenderer_name$ref,
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

module.exports = node;
