/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<0ce6d8dc85de27c3600b6c751cc078fa>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type QueryResourceTest4Fragment$ref: FragmentReference;
declare export opaque type QueryResourceTest4Fragment$fragmentType: QueryResourceTest4Fragment$ref;
export type QueryResourceTest4Fragment = {|
  +id: string,
  +$refType: QueryResourceTest4Fragment$ref,
|};
export type QueryResourceTest4Fragment$data = QueryResourceTest4Fragment;
export type QueryResourceTest4Fragment$key = {
  +$data?: QueryResourceTest4Fragment$data,
  +$fragmentRefs: QueryResourceTest4Fragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "QueryResourceTest4Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "ccf6ec5f4f4ab422e8bac9b21bd36e96";
}

module.exports = node;
