/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<ef934a039bbabddc75989cf31329f99c>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type fetchQueryTestFragment$ref: FragmentReference;
declare export opaque type fetchQueryTestFragment$fragmentType: fetchQueryTestFragment$ref;
export type fetchQueryTestFragment = {|
  +name: string,
  +$refType: fetchQueryTestFragment$ref,
|};
export type fetchQueryTestFragment$data = fetchQueryTestFragment;
export type fetchQueryTestFragment$key = {
  +$data?: fetchQueryTestFragment$data,
  +$fragmentRefs: fetchQueryTestFragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "fetchQueryTestFragment",
  "selections": [
    {
      "kind": "RequiredField",
      "field": {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "name",
        "storageKey": null
      },
      "action": "THROW",
      "path": "name"
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "7f2fe4c26db9bf66d873fc1d67d8b378";
}

module.exports = node;
