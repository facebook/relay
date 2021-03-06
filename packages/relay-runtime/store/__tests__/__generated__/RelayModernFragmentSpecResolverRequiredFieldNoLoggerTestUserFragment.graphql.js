/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<b31f327795940e72282e2844a22964ef>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernFragmentSpecResolverRequiredFieldNoLoggerTestUserFragment$ref: FragmentReference;
declare export opaque type RelayModernFragmentSpecResolverRequiredFieldNoLoggerTestUserFragment$fragmentType: RelayModernFragmentSpecResolverRequiredFieldNoLoggerTestUserFragment$ref;
export type RelayModernFragmentSpecResolverRequiredFieldNoLoggerTestUserFragment = ?{|
  +id: string,
  +alternate_name: string,
  +$refType: RelayModernFragmentSpecResolverRequiredFieldNoLoggerTestUserFragment$ref,
|};
export type RelayModernFragmentSpecResolverRequiredFieldNoLoggerTestUserFragment$data = RelayModernFragmentSpecResolverRequiredFieldNoLoggerTestUserFragment;
export type RelayModernFragmentSpecResolverRequiredFieldNoLoggerTestUserFragment$key = {
  +$data?: RelayModernFragmentSpecResolverRequiredFieldNoLoggerTestUserFragment$data,
  +$fragmentRefs: RelayModernFragmentSpecResolverRequiredFieldNoLoggerTestUserFragment$ref,
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

module.exports = node;
