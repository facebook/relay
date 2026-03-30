/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<950960ffd30f8217a6aaa0e542cd5f17>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type FragmentResourceRequiredFieldTestUserFragment$fragmentType: FragmentType;
export type FragmentResourceRequiredFieldTestUserFragment$data = ?{|
  +alternate_name: string,
  +id: string,
  +name: string,
  +$fragmentType: FragmentResourceRequiredFieldTestUserFragment$fragmentType,
|};
export type FragmentResourceRequiredFieldTestUserFragment$key = {
  +$data?: FragmentResourceRequiredFieldTestUserFragment$data,
  +$fragmentSpreads: FragmentResourceRequiredFieldTestUserFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "FragmentResourceRequiredFieldTestUserFragment",
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
  (node/*:: as any*/).hash = "0c0aef0e7704a8313459923e0528a5e5";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  FragmentResourceRequiredFieldTestUserFragment$fragmentType,
  FragmentResourceRequiredFieldTestUserFragment$data,
>*/);
