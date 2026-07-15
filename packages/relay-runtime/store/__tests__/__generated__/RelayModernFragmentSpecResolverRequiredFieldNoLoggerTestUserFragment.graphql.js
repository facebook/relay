/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<75d72c29b9e44b1c35c08fa081084deb>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernFragmentSpecResolverRequiredFieldNoLoggerTestUserFragment$fragmentType: FragmentType;
export type RelayModernFragmentSpecResolverRequiredFieldNoLoggerTestUserFragment$data = ?{
  readonly alternate_name: string,
  readonly id: string,
  readonly $fragmentType: RelayModernFragmentSpecResolverRequiredFieldNoLoggerTestUserFragment$fragmentType,
};
export type RelayModernFragmentSpecResolverRequiredFieldNoLoggerTestUserFragment$key = {
  readonly $data?: RelayModernFragmentSpecResolverRequiredFieldNoLoggerTestUserFragment$data,
  readonly $fragmentSpreads: RelayModernFragmentSpecResolverRequiredFieldNoLoggerTestUserFragment$fragmentType,
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
      "action": "LOG"
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "302a82f8e309099d8502fba5c26576bf";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayModernFragmentSpecResolverRequiredFieldNoLoggerTestUserFragment$fragmentType,
  RelayModernFragmentSpecResolverRequiredFieldNoLoggerTestUserFragment$data,
>*/);
