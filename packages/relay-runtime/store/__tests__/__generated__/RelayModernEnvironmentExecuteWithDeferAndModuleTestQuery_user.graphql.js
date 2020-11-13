/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<512957eefffcbdfd43e5ad3715eac591>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery_user$ref: FragmentReference;
declare export opaque type RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery_user$fragmentType: RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery_user$ref;
export type RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery_user = {|
  +id: string,
  +name: ?string,
  +$refType: RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery_user$ref,
|};
export type RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery_user$data = RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery_user;
export type RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery_user$key = {
  +$data?: RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery_user$data,
  +$fragmentRefs: RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery_user$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery_user",
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
  (node/*: any*/).hash = "8fb94afd920ae45f035f75359e26d76e";
}

module.exports = node;
