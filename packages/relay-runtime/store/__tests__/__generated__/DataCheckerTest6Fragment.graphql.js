/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<becc1fb081320940f84416685707be7b>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type DataCheckerTest6Fragment$ref: FragmentReference;
declare export opaque type DataCheckerTest6Fragment$fragmentType: DataCheckerTest6Fragment$ref;
export type DataCheckerTest6Fragment = {|
  +id: string,
  +name: ?string,
  +$refType: DataCheckerTest6Fragment$ref,
|};
export type DataCheckerTest6Fragment$data = DataCheckerTest6Fragment;
export type DataCheckerTest6Fragment$key = {
  +$data?: DataCheckerTest6Fragment$data,
  +$fragmentRefs: DataCheckerTest6Fragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DataCheckerTest6Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
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
  (node/*: any*/).hash = "a0b736027f00dc43e7485caf5a756903";
}

module.exports = node;
