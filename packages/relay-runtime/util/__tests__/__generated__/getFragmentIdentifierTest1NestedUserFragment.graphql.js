/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<a0bd3ada1b7fc671f069cf5c7224d6e0>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type getFragmentIdentifierTest1NestedUserFragment$fragmentType: FragmentType;
export type getFragmentIdentifierTest1NestedUserFragment$ref = getFragmentIdentifierTest1NestedUserFragment$fragmentType;
export type getFragmentIdentifierTest1NestedUserFragment$data = {|
  +username: ?string,
  +$refType: getFragmentIdentifierTest1NestedUserFragment$fragmentType,
  +$fragmentType: getFragmentIdentifierTest1NestedUserFragment$fragmentType,
|};
export type getFragmentIdentifierTest1NestedUserFragment = getFragmentIdentifierTest1NestedUserFragment$data;
export type getFragmentIdentifierTest1NestedUserFragment$key = {
  +$data?: getFragmentIdentifierTest1NestedUserFragment$data,
  +$fragmentRefs: getFragmentIdentifierTest1NestedUserFragment$fragmentType,
  +$fragmentSpreads: getFragmentIdentifierTest1NestedUserFragment$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  getFragmentIdentifierTest1NestedUserFragment$fragmentType,
  getFragmentIdentifierTest1NestedUserFragment$data,
>*/);
