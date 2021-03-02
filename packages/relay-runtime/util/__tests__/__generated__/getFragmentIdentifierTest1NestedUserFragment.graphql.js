/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<f87df62bf5758e6b76f98e5d0d68a7cd>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type getFragmentIdentifierTest1NestedUserFragment$ref: FragmentReference;
declare export opaque type getFragmentIdentifierTest1NestedUserFragment$fragmentType: getFragmentIdentifierTest1NestedUserFragment$ref;
export type getFragmentIdentifierTest1NestedUserFragment = {|
  +username: ?string,
  +$refType: getFragmentIdentifierTest1NestedUserFragment$ref,
|};
export type getFragmentIdentifierTest1NestedUserFragment$data = getFragmentIdentifierTest1NestedUserFragment;
export type getFragmentIdentifierTest1NestedUserFragment$key = {
  +$data?: getFragmentIdentifierTest1NestedUserFragment$data,
  +$fragmentRefs: getFragmentIdentifierTest1NestedUserFragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "getFragmentIdentifierTest1NestedUserFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "username",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "416e0c5b76d8b86295b2ba956b602ea7";
}

module.exports = node;
