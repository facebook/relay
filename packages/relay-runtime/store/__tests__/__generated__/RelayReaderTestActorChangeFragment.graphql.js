/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<5a895afc81600943090f97d0b9d14e6a>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayReaderTestActorChangeFragment$ref: FragmentReference;
declare export opaque type RelayReaderTestActorChangeFragment$fragmentType: RelayReaderTestActorChangeFragment$ref;
export type RelayReaderTestActorChangeFragment = {|
  +name: ?string,
  +$refType: RelayReaderTestActorChangeFragment$ref,
|};
export type RelayReaderTestActorChangeFragment$data = RelayReaderTestActorChangeFragment;
export type RelayReaderTestActorChangeFragment$key = {
  +$data?: RelayReaderTestActorChangeFragment$data,
  +$fragmentRefs: RelayReaderTestActorChangeFragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayReaderTestActorChangeFragment",
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
  (node/*: any*/).hash = "fd02a74ad0fea268d2dc732ad2d56c26";
}

module.exports = node;
