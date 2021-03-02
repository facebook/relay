/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<78068c60ef0dc769ef78bb47111a5ad4>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type QueryResourceTest3Fragment$ref: FragmentReference;
declare export opaque type QueryResourceTest3Fragment$fragmentType: QueryResourceTest3Fragment$ref;
export type QueryResourceTest3Fragment = {|
  +id: string,
  +$refType: QueryResourceTest3Fragment$ref,
|};
export type QueryResourceTest3Fragment$data = QueryResourceTest3Fragment;
export type QueryResourceTest3Fragment$key = {
  +$data?: QueryResourceTest3Fragment$data,
  +$fragmentRefs: QueryResourceTest3Fragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "QueryResourceTest3Fragment",
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
  (node/*: any*/).hash = "6a44f17afe34540ffe0084ee7abe4cbf";
}

module.exports = node;
