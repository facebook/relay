/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<b61e80aef713b3941e79917492dbe850>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernFragmentSpecResolverRequiredFieldTestUserFragment$ref: FragmentReference;
declare export opaque type RelayModernFragmentSpecResolverRequiredFieldTestUserFragment$fragmentType: RelayModernFragmentSpecResolverRequiredFieldTestUserFragment$ref;
export type RelayModernFragmentSpecResolverRequiredFieldTestUserFragment = ?{|
  +id: string,
  +name: string,
  +alternate_name: string,
  +$refType: RelayModernFragmentSpecResolverRequiredFieldTestUserFragment$ref,
|};
export type RelayModernFragmentSpecResolverRequiredFieldTestUserFragment$data = RelayModernFragmentSpecResolverRequiredFieldTestUserFragment;
export type RelayModernFragmentSpecResolverRequiredFieldTestUserFragment$key = {
  +$data?: RelayModernFragmentSpecResolverRequiredFieldTestUserFragment$data,
  +$fragmentRefs: RelayModernFragmentSpecResolverRequiredFieldTestUserFragment$ref,
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
  (node/*: any*/).hash = "15bfebf51ae674d445595318b62ed156";
}

module.exports = node;
