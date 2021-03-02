/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<239741f61d702c7bc9dc0a3db0c78c87>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type QueryResourceTest1Fragment$ref: FragmentReference;
declare export opaque type QueryResourceTest1Fragment$fragmentType: QueryResourceTest1Fragment$ref;
export type QueryResourceTest1Fragment = {|
  +id: string,
  +$refType: QueryResourceTest1Fragment$ref,
|};
export type QueryResourceTest1Fragment$data = QueryResourceTest1Fragment;
export type QueryResourceTest1Fragment$key = {
  +$data?: QueryResourceTest1Fragment$data,
  +$fragmentRefs: QueryResourceTest1Fragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "QueryResourceTest1Fragment",
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
  (node/*: any*/).hash = "64ec68c5df66664d1369d56db908e8a9";
}

module.exports = node;
