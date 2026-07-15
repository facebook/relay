/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<b1a1e6db0eea4c6b1b7c467735760c94>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type FragmentResourceRequiredFieldTestUserFragment$fragmentType: FragmentType;
export type FragmentResourceRequiredFieldTestUserFragment$data = ?{
  readonly alternate_name: string,
  readonly id: string,
  readonly name: string,
  readonly $fragmentType: FragmentResourceRequiredFieldTestUserFragment$fragmentType,
};
export type FragmentResourceRequiredFieldTestUserFragment$key = {
  readonly $data?: FragmentResourceRequiredFieldTestUserFragment$data,
  readonly $fragmentSpreads: FragmentResourceRequiredFieldTestUserFragment$fragmentType,
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
