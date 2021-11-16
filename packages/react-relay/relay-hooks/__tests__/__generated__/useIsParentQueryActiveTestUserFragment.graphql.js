/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<337b0a9a33b02aa9364754dce730e6af>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type useIsParentQueryActiveTestUserFragment$fragmentType: FragmentType;
export type useIsParentQueryActiveTestUserFragment$ref = useIsParentQueryActiveTestUserFragment$fragmentType;
export type useIsParentQueryActiveTestUserFragment$data = {|
  +id: string,
  +name: ?string,
  +$refType: useIsParentQueryActiveTestUserFragment$fragmentType,
  +$fragmentType: useIsParentQueryActiveTestUserFragment$fragmentType,
|};
export type useIsParentQueryActiveTestUserFragment = useIsParentQueryActiveTestUserFragment$data;
export type useIsParentQueryActiveTestUserFragment$key = {
  +$data?: useIsParentQueryActiveTestUserFragment$data,
  +$fragmentRefs: useIsParentQueryActiveTestUserFragment$fragmentType,
  +$fragmentSpreads: useIsParentQueryActiveTestUserFragment$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  useIsParentQueryActiveTestUserFragment$fragmentType,
  useIsParentQueryActiveTestUserFragment$data,
>*/);
