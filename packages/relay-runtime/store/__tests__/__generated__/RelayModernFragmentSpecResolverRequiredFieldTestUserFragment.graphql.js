/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<e03bc27e4ac8de5fc0adb35c5ddd15a5>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernFragmentSpecResolverRequiredFieldTestUserFragment$fragmentType: FragmentType;
export type RelayModernFragmentSpecResolverRequiredFieldTestUserFragment$data = ?{|
  +alternate_name: string,
  +id: string,
  +name: string,
  +$fragmentType: RelayModernFragmentSpecResolverRequiredFieldTestUserFragment$fragmentType,
|};
export type RelayModernFragmentSpecResolverRequiredFieldTestUserFragment$key = {
  +$data?: RelayModernFragmentSpecResolverRequiredFieldTestUserFragment$data,
  +$fragmentSpreads: RelayModernFragmentSpecResolverRequiredFieldTestUserFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernFragmentSpecResolverRequiredFieldTestUserFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "kind": "RequiredField",
      "field": {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "name",
        "storageKey": null
      },
      "action": "THROW"
    },
    {
      "kind": "RequiredField",
      "field": {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "alternate_name",
        "storageKey": null
      },
      "action": "LOG"
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "15bfebf51ae674d445595318b62ed156";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernFragmentSpecResolverRequiredFieldTestUserFragment$fragmentType,
  RelayModernFragmentSpecResolverRequiredFieldTestUserFragment$data,
>*/);
