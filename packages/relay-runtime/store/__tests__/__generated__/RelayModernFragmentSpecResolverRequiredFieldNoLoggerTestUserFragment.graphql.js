/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<05c1f8e5d84050949e4f89995182795b>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernFragmentSpecResolverRequiredFieldNoLoggerTestUserFragment$fragmentType: FragmentType;
export type RelayModernFragmentSpecResolverRequiredFieldNoLoggerTestUserFragment$ref = RelayModernFragmentSpecResolverRequiredFieldNoLoggerTestUserFragment$fragmentType;
export type RelayModernFragmentSpecResolverRequiredFieldNoLoggerTestUserFragment$data = ?{|
  +id: string,
  +alternate_name: string,
  +$fragmentType: RelayModernFragmentSpecResolverRequiredFieldNoLoggerTestUserFragment$fragmentType,
|};
export type RelayModernFragmentSpecResolverRequiredFieldNoLoggerTestUserFragment = RelayModernFragmentSpecResolverRequiredFieldNoLoggerTestUserFragment$data;
export type RelayModernFragmentSpecResolverRequiredFieldNoLoggerTestUserFragment$key = {
  +$data?: RelayModernFragmentSpecResolverRequiredFieldNoLoggerTestUserFragment$data,
  +$fragmentSpreads: RelayModernFragmentSpecResolverRequiredFieldNoLoggerTestUserFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernFragmentSpecResolverRequiredFieldNoLoggerTestUserFragment",
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
  (node/*: any*/).hash = "302a82f8e309099d8502fba5c26576bf";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernFragmentSpecResolverRequiredFieldNoLoggerTestUserFragment$fragmentType,
  RelayModernFragmentSpecResolverRequiredFieldNoLoggerTestUserFragment$data,
>*/);
