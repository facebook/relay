/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<ac4add924111d68079150ea7c9f35500>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type FragmentResourceRequiredFieldTestUserFragment$ref: FragmentReference;
declare export opaque type FragmentResourceRequiredFieldTestUserFragment$fragmentType: FragmentResourceRequiredFieldTestUserFragment$ref;
export type FragmentResourceRequiredFieldTestUserFragment = ?{|
  +id: string,
  +name: string,
  +alternate_name: string,
  +$refType: FragmentResourceRequiredFieldTestUserFragment$ref,
|};
export type FragmentResourceRequiredFieldTestUserFragment$data = FragmentResourceRequiredFieldTestUserFragment;
export type FragmentResourceRequiredFieldTestUserFragment$key = {
  +$data?: FragmentResourceRequiredFieldTestUserFragment$data,
  +$fragmentRefs: FragmentResourceRequiredFieldTestUserFragment$ref,
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
      "action": "THROW",
      "path": "name"
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
      "action": "LOG",
      "path": "alternate_name"
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "0c0aef0e7704a8313459923e0528a5e5";
}

module.exports = node;
