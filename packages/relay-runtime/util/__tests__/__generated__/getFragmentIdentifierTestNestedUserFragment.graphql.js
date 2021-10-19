/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<afaf0c5be3139c4c3e35eeab22f785b9>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type getFragmentIdentifierTestNestedUserFragment$ref: FragmentReference;
declare export opaque type getFragmentIdentifierTestNestedUserFragment$fragmentType: getFragmentIdentifierTestNestedUserFragment$ref;
export type getFragmentIdentifierTestNestedUserFragment = {|
  +username: ?string,
  +$refType: getFragmentIdentifierTestNestedUserFragment$ref,
|};
export type getFragmentIdentifierTestNestedUserFragment$data = getFragmentIdentifierTestNestedUserFragment;
export type getFragmentIdentifierTestNestedUserFragment$key = {
  +$data?: getFragmentIdentifierTestNestedUserFragment$data,
  +$fragmentRefs: getFragmentIdentifierTestNestedUserFragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "getFragmentIdentifierTestNestedUserFragment",
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
  (node/*: any*/).hash = "75c693cc47597efb281a82456e21fd4d";
}

module.exports = node;
