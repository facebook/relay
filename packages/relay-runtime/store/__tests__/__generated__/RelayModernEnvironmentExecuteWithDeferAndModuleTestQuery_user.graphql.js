/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<a587e80d23472336cd13962959702518>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery_user$fragmentType: FragmentType;
export type RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery_user$ref = RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery_user$fragmentType;
export type RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery_user$data = {|
  +id: string,
  +name: ?string,
  +$fragmentType: RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery_user$fragmentType,
|};
export type RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery_user = RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery_user$data;
export type RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery_user$key = {
  +$data?: RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery_user$data,
  +$fragmentSpreads: RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery_user$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery_user$fragmentType,
  RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery_user$data,
>*/);
