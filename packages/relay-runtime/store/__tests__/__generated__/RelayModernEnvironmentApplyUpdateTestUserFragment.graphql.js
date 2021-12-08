/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<bef1a50937e1963c08e49bd307c515a5>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentApplyUpdateTestUserFragment$fragmentType: FragmentType;
export type RelayModernEnvironmentApplyUpdateTestUserFragment$ref = RelayModernEnvironmentApplyUpdateTestUserFragment$fragmentType;
export type RelayModernEnvironmentApplyUpdateTestUserFragment$data = {|
  +id: string,
  +name: ?string,
  +$fragmentType: RelayModernEnvironmentApplyUpdateTestUserFragment$fragmentType,
|};
export type RelayModernEnvironmentApplyUpdateTestUserFragment = RelayModernEnvironmentApplyUpdateTestUserFragment$data;
export type RelayModernEnvironmentApplyUpdateTestUserFragment$key = {
  +$data?: RelayModernEnvironmentApplyUpdateTestUserFragment$data,
  +$fragmentSpreads: RelayModernEnvironmentApplyUpdateTestUserFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentApplyUpdateTestUserFragment",
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
  (node/*: any*/).hash = "59a86b8db77168741fbfd84fdf0c472c";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentApplyUpdateTestUserFragment$fragmentType,
  RelayModernEnvironmentApplyUpdateTestUserFragment$data,
>*/);
