/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<c8bd891c01119c24cd53e92280366545>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type useIsParentQueryActiveTestUserFragment$ref: FragmentReference;
declare export opaque type useIsParentQueryActiveTestUserFragment$fragmentType: useIsParentQueryActiveTestUserFragment$ref;
export type useIsParentQueryActiveTestUserFragment = {|
  +id: string,
  +name: ?string,
  +$refType: useIsParentQueryActiveTestUserFragment$ref,
|};
export type useIsParentQueryActiveTestUserFragment$data = useIsParentQueryActiveTestUserFragment;
export type useIsParentQueryActiveTestUserFragment$key = {
  +$data?: useIsParentQueryActiveTestUserFragment$data,
  +$fragmentRefs: useIsParentQueryActiveTestUserFragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "useIsParentQueryActiveTestUserFragment",
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
  (node/*: any*/).hash = "f103e250b237cd41de7e9157b3bd6591";
}

module.exports = node;
